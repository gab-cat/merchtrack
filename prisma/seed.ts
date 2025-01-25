// no-dd-sa:typescript-best-practices/no-console

import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { permissions } from './seeds/permissions';

const prisma = new PrismaClient();

console.log('Seeding database...');

async function main() {
  try {
    // Create the admin user
    const adminUser = await prisma.user.create({
      data: {
        clerkId: process.env.CLERK_TEST_ADMIN_USER ?? 'clerk_id_here',
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
        isStaff: true,
        isAdmin: true,
        role: 'STAFF_FACULTY',
        college: 'COCS'
      }
    });

    // Create the staff user reporting to admin
    const staffUser = await prisma.user.create({
      data: {
        clerkId: process.env.CLERK_TEST_STAFF_USER ?? 'clerk_id_here',
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
        isStaff: true,
        role: 'STAFF_FACULTY',
        college: 'COCS',
        manager: {
          connect: {
            clerkId: adminUser.clerkId
          }
        }
      }
    });

    for (const permission of permissions) {
      await prisma.permission.create({
        data: permission,
      });
    }

    // Assign permissions to admin user
    await prisma.userPermission.createMany({
      data: permissions.map(permission => ({
        userId: adminUser.id,
        permissionId: permission.code,
        canCreate: true,
        canRead: true,
        canUpdate: true,
        canDelete: true
      }))
    });

    // Assign permissions to staff user
    await prisma.userPermission.createMany({
      data: permissions.map(permission => ({
        userId: staffUser.id,
        permissionId: permission.code,
        canCreate: true,
        canRead: true,
        canUpdate: true,
        canDelete: true
      }))
    });

    // Create 10 categories
    const categories = await Promise.all(
      Array(10).fill(null).map((_, i) => 
        prisma.category.create({
          data: {
            name: `Category ${i + 1}`,
            description: faker.commerce.department()
          }
        })
      )
    );

    enum Role {
      PLAYER = "PLAYER",
      STUDENT = "STUDENT",
      STUDENT_NON_COLLEGE = "STUDENT_NON_COLLEGE",
      STAFF_FACULTY = "STAFF_FACULTY",
      ALUMNI = "ALUMNI",
      OTHERS = "OTHERS"
    }

    // Create 10 products with variants
    const products = await Promise.all(
      Array(10).fill(null).map((_, i) =>
        prisma.product.create({
          data: {
            title: faker.commerce.productName(),
            description: faker.commerce.productDescription(),
            categoryId: categories[i].id,
            postedById: adminUser.id,
            slug: faker.helpers.slugify(faker.commerce.productName()),
            imageUrl: faker.image.url(),
            variants: {
              create: Array(3).fill(null).map(() => {
                const basePrice = faker.number.float({ min: 10, max: 100, fractionDigits: 2 });
                
                return {
                  variantName: faker.commerce.productMaterial(),
                  price: basePrice, // Base price (could map to OTHERS role)
                  rolePricing: {
                    [Role.PLAYER]: basePrice * 0.7, // 30% discount for players
                    [Role.STUDENT]: basePrice * 0.8, // 20% student discount
                    [Role.STUDENT_NON_COLLEGE]: basePrice * 0.85,
                    [Role.STAFF_FACULTY]: basePrice * 0.9, // 10% staff discount
                    [Role.ALUMNI]: basePrice * 0.75,
                    [Role.OTHERS]: basePrice
                  }
                };
              })
            }
          },
          include: { variants: true }
        })
      )
    );
    
    // Create 10 orders with items
    const orders = await Promise.all(
      Array(10).fill(null).map(() =>
        prisma.order.create({
          data: {
            customerId: adminUser.id,
            processedById: staffUser.id,
            totalAmount: faker.number.float({ min: 50, max: 500 }),
            estimatedDelivery: faker.date.future(),
            orderItems: {
              create: Array(faker.number.int({ min: 1, max: 5 })).fill(null).map(() => {
                const product = products[faker.number.int({ min: 0, max: 9 })];
                const variant = product.variants[0];
                return {
                  variantId: variant.id,
                  quantity: faker.number.int({ min: 1, max: 5 }),
                  price: variant.price,
                  size: faker.helpers.arrayElement(['XS', 'S', 'M', 'L', 'XL'])
                };
              })
            }
          }
        })
      )
    );
    
    // Create carts for users
    await Promise.all(
      [adminUser, staffUser].map(user =>
        prisma.cart.create({
          data: {
            userId: user.id,
            cartItems: {
              create: Array(faker.number.int({ min: 1, max: 5 })).fill(null).map(() => ({
                variantId: faker.helpers.arrayElement(products[faker.number.int({ min: 0, max: 9 })].variants).id,
                quantity: faker.number.int({ min: 1, max: 5 })
              }))
            }
          },
          include: { cartItems: true }
        })
      )
    );

    // Create 10 payments
    await Promise.all(
      orders.map(order =>
        prisma.payment.create({
          data: {
            orderId: order.id,
            userId: adminUser.id,
            amount: order.totalAmount,
            paymentMethod: faker.helpers.arrayElement(['CASH', 'GCASH', 'BANK_TRANSFER']),
            paymentStatus: 'VERIFIED'
          }
        })
      )
    );
    
    // Create 10 fulfillments
    await Promise.all(
      orders.map(order =>
        prisma.fulfillment.create({
          data: {
            orderId: order.id,
            processedById: staffUser.id,
            status: faker.helpers.arrayElement(['PRODUCTION', 'READY', 'COMPLETED'])
          }
        })
      )
    );
    
    // Create 10 survey categories
    const surveyCategories = await Promise.all(
      Array(10).fill(null).map((_, i) =>
        prisma.surveyCategory.create({
          data: {
            name: `Survey Category ${i + 1}`,
            question1: `How satisfied were you with aspect ${i + 1}?`,
            question2: `Would you recommend feature ${i + 1}?`,
            question3: `How likely to purchase ${i + 1} again?`,
            question4: `Rating for service ${i + 1}?`
          }
        })
      )
    );
    
    // Create 10 customer surveys
    await Promise.all(
      orders.slice(0, 10).map(order =>
        prisma.customerSatisfactionSurvey.create({
          data: {
            orderId: order.id,
            categoryId: surveyCategories[0].id,
            answers: {
              q1: faker.number.int({ min: 1, max: 5 }),
              q2: faker.number.int({ min: 1, max: 5 }),
              q3: faker.number.int({ min: 1, max: 5 }),
              q4: faker.number.int({ min: 1, max: 5 })
            }
          }
        })
      )
    );
    
    // Create 10 messages
    await Promise.all(
      Array(10).fill(null).map(() =>
        prisma.message.create({
          data: {
            email: faker.internet.email(),
            subject: faker.lorem.sentence(),
            message: faker.lorem.paragraph(),
            isSentByCustomer: faker.datatype.boolean()
          }
        })
      )
    );
    
    // Create 10 logs
    await Promise.all(
      Array(10).fill(null).map(() =>
        prisma.log.create({
          data: {
            systemText: faker.lorem.sentence(),
            userText: faker.lorem.sentence(),
            createdById: staffUser.id,
            reason: faker.lorem.sentence()
          }
        })
      )
    );

    // Create 10 tickets
    await Promise.all(
      Array(10).fill(null).map(() =>
        prisma.ticket.create({
          data: {
            title: faker.lorem.sentence(),
            description: faker.lorem.paragraph(),
            createdById: adminUser.id,
            assignedToId: staffUser.id,
            status: 'OPEN',
            priority: 'MEDIUM'
          }
        })
      )
    );

    // Create 10 reviews
    await Promise.all(
      Array(10).fill(null).map(() =>
        prisma.review.create({
          data: {
            productId: products[faker.number.int({ min: 0, max: 9 })].id,
            userId: adminUser.id,
            rating: faker.number.int({ min: 1, max: 5 }),
            comment: faker.lorem.sentence()
          }
        })
      )
    );

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    await prisma.$executeRaw`TRUNCATE TABLE "UserPermission" CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "Permission" CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "User" CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "Category" CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "Product" CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "Order" CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "OrderItem" CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "Cart" CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "CartItem" CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "Payment" CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "Fulfillment" CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "SurveyCategory" CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "CustomerSatisfactionSurvey" CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "Message" CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "Log" CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "Ticket" CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "Review" CASCADE`;
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();