const loginSubmitBtn = document.getElementById("login-submit-btn");
const signupBtn = document.getElementById("signup-btn");
const forgotpassword = document.getElementById("forgotpassword-page");

loginSubmitBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  try {
    const username = document.getElementById("username-input").value;
    const password = document.getElementById("password-input").value;

    const response = await fetch("http://127.0.0.1:8000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });

    const data = await response.json();
    console.log(response);
    if (!response.ok) {
      const errorMsg = data.message || `Login failed with status: ${response.status}`;
      console.log(errorMsg);
      throw new Error(errorMsg);
    }

    localStorage.setItem("authToken", data.token);

    displayErrorMessage("Login successful! Redirecting...", true);

    setTimeout(async () => {
      try {
        const token = localStorage.getItem("authToken");

        const profileResponse = await fetch("http://127.0.0.1:8000/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!profileResponse.ok) throw new Error("Failed to load profile");

        const html = await profileResponse.text();
        document.open();
        document.write(html);
        document.close();
      } catch (error) {
        console.error("Profile load error:", error);
        displayErrorMessage(error, false);
      }
    }, 1000);
  } catch (error) {
    displayErrorMessage(error, false);
  }
});

signupBtn.addEventListener("click", (e) => {
  e.preventDefault();

  window.location.href = "http://127.0.0.1:8000/signup";
});

forgotpassword.addEventListener("click", (e) => {
  e.preventDefault();

  window.location("##forgotpassword-page");
});

function displayErrorMessage(message, isSuccess) {
  const errorMessageElement = document.querySelector(".error-message");
  errorMessageElement.style.display = "block";
  errorMessageElement.textContent = message;

  errorMessageElement.style.color = isSuccess ? "green" : "red";
  setTimeout(() => {
    errorMessageElement.style.display = "none";
  }, 5000);
}
