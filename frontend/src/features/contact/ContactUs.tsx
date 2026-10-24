import { useEffect, useState, type FormEvent } from "react";
import WarpBackground from "../../components/ui/WarpBackground";
import "./ContactUs.css";

const TO_EMAIL = "vanshchauhan4578@gmail.com";

export default function ContactUs() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    document.title = "Contact Us | LITFEST 2.0";
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const feedback = String(formData.get("feedback") ?? "").trim();
    const subject = "Website Feedback";
    const body = [
      `Name: ${name.trim()}`,
      `From: ${email}`,
      `Contact No: ${phone.trim()}`,
      `Feedback:\n${feedback}`,
    ].join("\n\n");
    const mailtoLink = `mailto:${TO_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    window.location.href = mailtoLink;
  };

  return (
    <main className="contact-page">
      <WarpBackground />
      <form className="contact-form" onSubmit={handleSubmit}>
        <header className="contact-form__header">
          <span className="contact-form__eyebrow">LITFEST 2.0</span>
          <h1>Contact Us</h1>
          <p>Have a question or feedback? We’d love to hear from you.</p>
        </header>

        <label htmlFor="contact-name">Your Name</label>
        <input
          autoComplete="name"
          id="contact-name"
          name="name"
          onChange={(event) =>
            setName(event.currentTarget.value.replace(/[0-9]/g, ""))
          }
          pattern="[^0-9]*"
          placeholder="Your Name"
          required
          title="Numbers are not allowed in your name."
          type="text"
          value={name}
        />

        <label htmlFor="contact-phone">Your Contact No</label>
        <input
          autoComplete="tel"
          id="contact-phone"
          inputMode="numeric"
          maxLength={10}
          name="phone"
          onChange={(event) =>
            setPhone(event.currentTarget.value.replace(/\D/g, "").slice(0, 10))
          }
          pattern="[0-9]{10}"
          placeholder="XXXXXXXXXX"
          required
          title="Enter a 10-digit phone number (digits only)."
          type="tel"
          value={phone}
        />

        <label htmlFor="contact-email">Your Email</label>
        <input
          autoComplete="email"
          id="contact-email"
          name="email"
          placeholder="you@example.com"
          required
          type="email"
        />

        <label htmlFor="contact-feedback">Your Feedback</label>
        <textarea
          id="contact-feedback"
          minLength={20}
          name="feedback"
          placeholder="Write your feedback here..."
          required
          rows={6}
        />

        <button type="submit">Submit</button>
      </form>
    </main>
  );
}
