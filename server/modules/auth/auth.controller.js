import { loginUser as login, registerUser as register } from "./auth.service.js";

// API to register user
export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const token = await register({ name, email, password });
    res.json({ success: true, token });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// API to login user
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const token = await login({ email, password });
    return res.json({ success: true, token });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// API to get user data (req.user is attached by `protect`, password already stripped)
export const getUser = async (req, res) => {
  try {
    const user = req.user;
    return res.json({ success: true, user });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};
