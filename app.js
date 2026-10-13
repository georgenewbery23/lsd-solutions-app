<!-- Sign In -->
<div id="signinForm">
  <label for="signin-email">Email Address</label>
  <input type="email" id="signin-email" name="signin_email" required>
  
  <label for="signin-password">Password</label>
  <input type="password" id="signin-password" name="signin_password" required>
  
  <button type="button" onclick="signIn()">Sign In</button>
</div>

<!-- Reset Password -->
<div id="resetForm" style="display:none;">
  <label for="reset-email">Email Address</label>
  <input type="email" id="reset-email" name="reset_email" required>
  <button type="button" onclick="sendReset()">Send Reset Link</button>
</div>

<!-- Register -->
<div id="registerForm" style="display:none;">
  <label for="register-name">Full Name</label>
  <input type="text" id="register-name" name="register_name" required>
  
  <label for="register-email">Email Address</label>
  <input type="email" id="register-email" name="register_email" required>
  
  <label for="register-password">Password</label>
  <input type="password" id="register-password" name="register_password" required>
  
  <button type="button" onclick="registerUser('driver')">Register as Driver</button>
  <button type="button" onclick="registerUser('company')">Register as Company</button>
</div>
