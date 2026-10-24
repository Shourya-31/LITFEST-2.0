import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import ContactUs from "./features/contact/ContactUs";
import SponsorPage from "./SponsorPageStandalone";

const path = window.location.pathname.toLowerCase().replace(/\/+$/, "");
const isContactPage = path === "/contact" || path.endsWith("/contactus.html");

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {isContactPage ? <ContactUs /> : <SponsorPage />}
  </StrictMode>
);