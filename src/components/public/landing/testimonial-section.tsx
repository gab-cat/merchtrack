"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const testimonials = [
  {
    name: "Alex Johnson",
    role: "Senior, Computer Science",
    content: "The university store has everything I need for my classes. Great selection and easy ordering process!",
    avatar: "/placeholder.svg?height=40&width=40&text=AJ",
  },
  {
    name: "Samantha Lee",
    role: "Freshman, Biology",
    content: "I love the variety of university merchandise. It's a great way to show school spirit!",
    avatar: "/placeholder.svg?height=40&width=40&text=SL",
  },
  {
    name: "Michael Brown",
    role: "Graduate Student, Business",
    content: "The textbook rental option has saved me so much money. Highly recommend!",
    avatar: "/placeholder.svg?height=40&width=40&text=MB",
  },
];

export default function TestimonialSection() {
  return (
    <section className="bg-primary/5 py-16">
      <div className="container mx-auto px-4">
        <h2 className="mb-8 text-center text-3xl font-bold">What Our Students Say</h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <p className="text-muted-foreground mb-4">&ldquo;{testimonial.content}&rdquo;</p>
                  <div className="flex items-center">
                    <Avatar className="mr-4 size-10">
                      <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                      <AvatarFallback>
                        {testimonial.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-muted-foreground text-sm">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

