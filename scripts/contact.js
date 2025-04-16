// contact.js — JavaScript for Contact Page

// Get CSRF token for secure form submissions
function getCSRFToken() {
  const cookies = document.cookie.split(";");
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === "csrftoken") {
      return value;
    }
  }
  return "";
}

document.addEventListener("DOMContentLoaded", () => {

  const contactForm = document.querySelector(".contact-form");

  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();

      // Get form data
      const name = document.getElementById("name").value;
      const email = document.getElementById("email").value;
      const subject = document.getElementById("subject").value;
      const message = document.getElementById("message").value;

      // Basic validation
      if (!name || !email || !subject || !message) {
        showFormMessage("Please fill in all fields", "error");
        return;
      }

      if (!isValidEmail(email)) {
        showFormMessage("Please enter a valid email address", "error");
        return;
      }

      // Prepare form data
      const formData = {
        name: name,
        email: email,
        subject: subject,
        message: message,
      };

      // Send form data to backend
      fetch("/api/contact/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCSRFToken(),
        },
        body: JSON.stringify(formData),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then((data) => {
          // Clear form
          contactForm.reset();
          showFormMessage("Thank you! Your message has been sent.", "success");
        })
        .catch((error) => {
          console.error("Error:", error);
          showFormMessage(
            "There was a problem sending your message. Please try again.",
            "error"
          );
        });
    });
  }

  // Helper function to validate email
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Updated function to add animation to form message
  function showFormMessage(message, type) {
    // Remove any existing message
    const existingMessage = document.querySelector(".form-message");
    if (existingMessage) {
      existingMessage.remove();
    }

    // Create new message element
    const messageElement = document.createElement("div");
    messageElement.className = `form-message ${type}`;
    messageElement.textContent = message;

    // Set initial opacity for animation
    messageElement.style.opacity = "0";
    messageElement.style.transform = "translateY(10px)";
    messageElement.style.transition = "all 0.3s ease";

    // Add message to DOM
    contactForm.appendChild(messageElement);

    // Trigger animation
    setTimeout(() => {
      messageElement.style.opacity = "1";
      messageElement.style.transform = "translateY(0)";
    }, 10);

    // Scroll to the message
    messageElement.scrollIntoView({ behavior: "smooth", block: "nearest" });

    // Remove message after 5 seconds if it's a success message
    if (type === "success") {
      setTimeout(() => {
        messageElement.style.opacity = "0";
        messageElement.style.transform = "translateY(-10px)";

        setTimeout(() => {
          messageElement.remove();
        }, 300);
      }, 5000);
    }
  }

  // Add focus effects to form inputs
  const formInputs = document.querySelectorAll(
    ".contact-form input, .contact-form textarea"
  );

  formInputs.forEach((input) => {
    input.addEventListener("focus", function () {
      this.parentElement.classList.add("focused");
    });

    input.addEventListener("blur", function () {
      if (!this.value) {
        this.parentElement.classList.remove("focused");
      }
    });

    // Check if input already has value (e.g. on page refresh)
    if (input.value) {
      input.parentElement.classList.add("focused");
    }
  });
});
