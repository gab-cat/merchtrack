# MerchTrack Database Schema Documentation

This document provides a comprehensive overview of the MerchTrack application's database schema, detailing the structure, relationships, and design patterns used throughout the system.

## Table of Contents

1. [Overview](#overview)
2. [Core Entities](#core-entities)
   - [User](#user)
   - [Product and Variants](#product-and-variants)
   - [Order System](#order-system)
   - [Payment](#payment)
3. [Support Features](#support-features)
   - [Permissions](#permissions)
   - [Messages](#messages)
   - [Tickets](#tickets)
   - [Reviews](#reviews)
   - [Announcements](#announcements)
4. [Shopping Experience](#shopping-experience)
   - [Cart](#cart)
   - [Fulfillment](#fulfillment)
5. [Feedback System](#feedback-system)
   - [Surveys](#surveys)
6. [Design Patterns](#design-patterns)
   - [Soft Delete](#soft-delete)
   - [Indexing Strategy](#indexing-strategy)
   - [Role-Based Access](#role-based-access)
   - [Audit Logging](#audit-logging)

## Overview

The MerchTrack database is designed around a merchandise ordering and tracking system tailored for an educational institution. It follows a microservice-oriented architecture with modular schema files that are organized by domain. The database uses PostgreSQL as its primary data store and employs Prisma ORM for type-safe database access.

The schema leverages modern database design patterns including:

- **Modular Schema Files**: Each domain has its own schema file for better organization
- **Unique Identifiers**: ULID (Universally Unique Lexicographically Sortable Identifier) for primary keys
- **Soft Delete Pattern**: `isDeleted` flag on major entities to preserve data integrity
- **Extensive Indexing**: Strategic indexing for optimal query performance
- **JSON Storage**: For flexible data structures like role-based pricing
- **Role-Based Access Control**: Granular permission system
- **Audit Logging**: Comprehensive logging for system activities

## Core Entities

### User

The User model is central to the application, representing both customers and staff members.

```prisma
model User {
  id             String      @id @default(ulid())
  isDeleted      Boolean     @default(false)
  clerkId        String      @unique  // For authentication with Clerk
  isOnboarded    Boolean     @default(false)
  firstName      String?
  lastName       String?
  managerId      String?     // For staff hierarchy
  imageUrl       String?
  email          String      @unique
  phone          String      @default("nan")
  courses        String      @default("nan")
  isStaff        Boolean     @default(false)
  isAdmin        Boolean     @default(false)
  role           Role        @default(STUDENT)
  college        College     @default(NOT_APPLICABLE)
  isMerchant     Boolean     @default(false)
  
  // Relations - omitted for brevity
}
```

Key features:
- **Authentication**: Integration with Clerk for identity management
- **Hierarchical Structure**: Staff members can have managers
- **Role-Based**: Different user types (STUDENT, STAFF_FACULTY, etc.)
- **College Affiliation**: Users can be associated with specific colleges

### Product and Variants

Products are structured with a variant system allowing for different sizes, materials or styles with separate pricing.

```prisma
model Product {
  id            String          @id @default(ulid())
  isDeleted     Boolean         @default(false)
  categoryId    String?
  postedById    String
  slug          String          @unique
  title         String
  description   String?
  imageUrl      String[]        // Array of image URLs
  tags          String[]        // Array of product tags
  inventory     Int             @default(0)
  inventoryType InventoryType   @default(PREORDER)
  
  // Relations
  category     Category?        @relation(fields: [categoryId], references: [id])
  variants     ProductVariant[]
  // Additional relations omitted
}

model ProductVariant {
  id           String      @id @default(ulid())
  productId    String
  variantName  String
  price        Decimal     @default(0)
  rolePricing  Json        // Flexible pricing for different user roles
  inventory    Int         @default(0)
  
  // Relations omitted
}
```

Key features:
- **Variant-Level Pricing**: Different prices for same product depending on the variant
- **Role-Based Pricing**: Different prices based on user role (student, staff, etc.)
- **Inventory Tracking**: Per-variant inventory management
- **Multiple Images**: Support for multiple product images
- **Tagging**: Flexible product tagging system

### Order System

The order system tracks purchases from initial creation through to delivery.

```prisma
model Order {
  id                String             @id @default(ulid())
  isDeleted         Boolean            @default(false)
  customerId        String
  processedById     String?
  status            OrderStatus        @default(PENDING)
  paymentStatus     OrderPaymentStatus @default(PENDING)
  totalAmount       Float              @default(0)
  discountAmount    Float              @default(0)
  estimatedDelivery DateTime
  customerNotes     String?            @db.Text
  paymentPreference PaymentPreference? @default(FULL)
  
  // Relations
  orderItems        OrderItem[]        @relation("OrderItemToOrder")
  // Additional relations omitted
}

model OrderItem {
  id           String       @id @default(ulid())
  orderId      String
  variantId    String
  quantity     Int
  price        Decimal      @default(0)
  originalPrice Decimal     @default(0)
  appliedRole  String       @default("OTHERS")
  customerNote String?
  size         ProductSize?
  
  // Relations omitted
}
```

Key features:
- **Status Tracking**: Orders can be tracked through multiple states
- **Payment Status**: Separate tracking for payment state
- **Multiple Items**: Each order can contain multiple items
- **Role-Based Pricing**: Retains the applied role discount for each item
- **Customer Notes**: Allows for special instructions

### Payment

The payment system supports multiple payment methods and tracks the entire payment lifecycle.

```prisma
model Payment {
  id           String         @id @default(ulid())
  orderId      String
  userId       String
  processedById String?
  amount       Float
  paymentDate  DateTime       @default(now())
  paymentMethod PaymentMethod
  paymentStatus PaymentStatus @default(PENDING)
  referenceNo  String?
  memo         String?
  paymentSite  PaymentSite    @default(ONSITE)
  
  // Additional fields and relations omitted
}
```

Key features:
- **Multiple Payment Methods**: Support for cash, digital payments, bank transfers
- **Status Tracking**: Comprehensive payment status lifecycle
- **Processing Records**: Tracks who processed the payment
- **Reference Numbers**: Support for transaction references
- **On/Offsite**: Differentiation between payments made in-person vs. remotely

## Support Features

### Permissions

MerchTrack implements a fine-grained permission system to control access to different features:

```prisma
model Permission {
  code        String         @id @db.VarChar(50)
  name        String
  description String?
  
  // Relations
  userPermissions UserPermission[]
}

model UserPermission {
  userId       String
  permissionId String
  canCreate    Boolean        @default(false)
  canRead      Boolean        @default(false)
  canUpdate    Boolean        @default(false)
  canDelete    Boolean        @default(false)
  
  // Relations
  user        User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  permission  Permission    @relation(fields: [permissionId], references: [code], onDelete: Cascade)
  
  @@id([userId, permissionId])
}
```

This granular system allows precise control over what actions each user can perform on different parts of the application.

### Messages

The messaging system allows communication between users and administrators:

```prisma
model Message {
  id               String    @id @default(ulid())
  isArchived       Boolean   @default(false)
  isRead           Boolean   @default(false)
  isResolved       Boolean   @default(false)
  isSentByCustomer Boolean   @default(false)
  isSentByAdmin    Boolean   @default(false)
  sentBy           String?
  email            String
  subject          String
  message          String
  
  // Relations omitted
}
```

### Tickets

A support ticket system for tracking issues and requests:

```prisma
model Ticket {
  id           String         @id @default(ulid())
  title        String
  description  String
  status       TicketStatus   @default(OPEN)
  priority     TicketPriority @default(MEDIUM)
  createdById  String
  assignedToId String?
  updates      Json           @default("[]")
  
  // Relations omitted
}
```

### Announcements

System-wide announcements with varying importance levels:

```prisma
model Announcement {
  id            String           @id @default(ulid())
  title         String
  type          AnnouncementType @default(NORMAL)
  level         AnnouncementLevel @default(INFO)
  publishedById String
  content       String
  publishedAt   DateTime         @default(now())
  
  // Relations omitted
}
```

## Shopping Experience

### Cart

Shopping cart functionality for saving items before purchase:

```prisma
model Cart {
  id       String     @id @default(ulid())
  userId   String
  
  // Relations
  user     User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  cartItems CartItem[]
}

model CartItem {
  id        String    @id @default(ulid())
  cartId    String
  variantId String
  quantity  Int       @default(0)
  selected  Boolean   @default(true)
  note      String?
  
  // Relations omitted
}
```

### Fulfillment

Tracks the processing and delivery of orders:

```prisma
model Fulfillment {
  id              String           @id @default(ulid())
  orderId         String
  processedById   String
  fulfillmentDate DateTime         @default(now())
  status          FulfillmentStatus @default(PENDING)
  
  // Relations omitted
}
```

## Feedback System

### Surveys

Customer satisfaction surveys tied to orders:

```prisma
model SurveyCategory {
  id          String    @id @default(ulid())
  isDeleted   Boolean   @default(false)
  name        String
  question1   String    @db.VarChar(200)
  question2   String    @db.VarChar(200)
  question3   String    @db.VarChar(200)
  question4   String    @db.VarChar(200)
  
  // Relations omitted
}

model CustomerSatisfactionSurvey {
  id         String    @id @default(ulid())
  orderId    String
  categoryId String
  answers    Json      // Stores answers to questions
  metadata   Json?     // Additional metadata
  
  // Relations omitted
}
```

## Design Patterns

### Soft Delete

Most entities use the `isDeleted` flag instead of actual deletion to maintain referential integrity and allow for data recovery:

```prisma
model Example {
  id        String   @id @default(ulid())
  isDeleted Boolean  @default(false)
  // Other fields...
  
  @@index([isDeleted])
}
```

### Indexing Strategy

The database heavily utilizes indexes for performance optimization:

```prisma
model Example {
  // Fields...
  
  @@index([fieldA], name: "idx_example_fieldA")
  @@index([fieldB, fieldC], name: "idx_example_composite")
}
```

### Role-Based Access

The combination of the `Role` enum, `Permission` model, and `UserPermission` model creates a comprehensive RBAC system:

1. **Roles** define general user types (STUDENT, STAFF_FACULTY, etc.)
2. **Permissions** define specific actions that can be performed
3. **UserPermissions** link users to permissions with CRUD capabilities

### Audit Logging

The system maintains detailed logs of all significant actions:

```prisma
model Log {
  id           String    @id @default(ulid())
  systemText   String
  userText     String?
  reason       String
  createdById  String
  userId       String?
  createdAt    DateTime  @default(now())
  
  // Relations omitted
}
```

This robust schema design enables MerchTrack to efficiently manage merchandise inventory, orders, payments, and customer interactions while maintaining data integrity and providing flexible access control.
