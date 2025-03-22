import ContactForm from "@/app/(public)/contact/(components)/contact-form";
import PageAnimation from "@/components/public/page-animation";
import PageTitle from "@/components/public/page-title";

export const revalidate = 900;

const ContactPage = () => {
  return (
    <PageAnimation className="max-w-4xl">
      <PageTitle
        title="Contact Us"
        description="Got a technical issue? Want to send feedback about a beta feature? Need details about our Business plan? Let us know."
      />
      <ContactForm />
    </PageAnimation>
  );
};

export default ContactPage;