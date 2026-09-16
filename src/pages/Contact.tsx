import { Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function Contact() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Your message has been sent. We will get back to you shortly.");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 animate-fade-in">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-serif font-bold tracking-tight mb-4">Contact Us</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          We would love to hear from you. Whether you have a question about our fragrances, your order, or anything else, our team is ready to answer all your questions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        {/* Contact Info */}
        <div className="space-y-10">
          <div>
            <h2 className="text-2xl font-serif font-bold mb-6">Get in Touch</h2>
            <div className="space-y-6 text-muted-foreground">
              <div className="flex items-start gap-4">
                <MapPin className="h-6 w-6 shrink-0 text-gold-600 dark:text-gold-400" />
                <div>
                  <h3 className="font-medium text-foreground mb-1">Our Boutique</h3>
                  <p>123 Rue de la Parfumerie</p>
                  <p>75008 Paris, France</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Phone className="h-6 w-6 shrink-0 text-gold-600 dark:text-gold-400" />
                <div>
                  <h3 className="font-medium text-foreground mb-1">Phone</h3>
                  <p>+33 1 23 45 67 89</p>
                  <p className="text-sm">Mon-Fri from 9am to 6pm</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Mail className="h-6 w-6 shrink-0 text-gold-600 dark:text-gold-400" />
                <div>
                  <h3 className="font-medium text-foreground mb-1">Email</h3>
                  <p>hello@oudroyale.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-card p-8 rounded-2xl shadow-sm border">
          <h2 className="text-2xl font-serif font-bold mb-6">Send a Message</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="John Doe" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" placeholder="john@example.com" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" placeholder="Order Inquiry" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="message">Message</Label>
              <textarea
                id="message"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 min-h-[120px]"
                placeholder="How can we help you?"
                required
              />
            </div>
            <Button type="submit" className="w-full h-12 rounded-full font-medium tracking-wide mt-2">
              Send Message
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
