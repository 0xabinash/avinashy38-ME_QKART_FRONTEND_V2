import { Button, CircularProgress, Stack, TextField } from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useState } from "react";
import { useHistory, Link } from "react-router-dom";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";
import "./Login.css";

const Login = () => {
  const history = useHistory()
  const initialValues = {username: "", password: ""}
  const { enqueueSnackbar } = useSnackbar();
  const [userInput, setUserInput] = useState(initialValues)
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState()

  const handleInput = (event) => {
    const {name, value} = event.target
    setUserInput((prevInput)=> ({
       ...prevInput, [name] : value
    }))
  }

  const login = async (formData) => {
    const resetInput = {username: "", password:""};
    const url = `${config.endpoint}/auth/login`;
    const validateResult = validateInput(formData);
    if(validateResult === false){
      return;
    }

    setIsLoading(true);   //loading-icon displaying 
    
    try{
      const response = await axios.post(url, formData)

      persistLogin(response.data.token, response.data.username, response.data.balance)
      setUser(response.data)
      enqueueSnackbar("Logged in successfully", {variant: "success"}) //snackbar for success message
      setUserInput(resetInput) // resetting userInput state
      setIsLoading(false); // loading icon stopped after success
      history.push("/")

    } catch(error){
      const otherError= "Something went wrong. Check that the backend is running, reachable and returns valid JSON."
      enqueueSnackbar( error.response.status === 400? error.response.data.message : otherError, {variant: "error"})
      setIsLoading(false); // loading icon stopped after error
    }
  };

  const validateInput = (data) => {
    const errors = {}
    errors.username = data.username === "" ? "username is required": "";
    if(errors.username !== ""){
      enqueueSnackbar(errors.username, {variant: "error"});
    }

    errors.password = data.password === "" ? "password is required" : "";
    if(errors.password !== ""){
      enqueueSnackbar(errors.password, {variant: "error"});
    }
    if(errors.username === "" && errors.password === ""){
      return true;
    }
    return false;
  };

  // TODO: CRIO_TASK_MODULE_LOGIN - Fetch the API response
  /**
   * Perform the Login API call
   * @param {{ username: string, password: string }} formData
   *  Object with values of username, password and confirm password user entered to register
   *
   * API endpoint - "POST /auth/login"
   *
   * Example for successful response from backend:
   * HTTP 201
   * {
   *      "success": true,
   *      "token": "testtoken",
   *      "username": "criodo",
   *      "balance": 5000
   * }
   *
   * Example for failed response from backend:
   * HTTP 400
   * {
   *      "success": false,
   *      "message": "Password is incorrect"
   * }
   *
   */
  

  // TODO: CRIO_TASK_MODULE_LOGIN - Validate the input
  /**
   * Validate the input values so that any bad or illegal values are not passed to the backend.
   *
   * @param {{ username: string, password: string }} data
   *  Object with values of username, password and confirm password user entered to register
   *
   * @returns {boolean}
   *    Whether validation has passed or not
   *
   * Return false and show warning message if any validation condition fails, otherwise return true.
   * (NOTE: The error messages to be shown for each of these cases, are given with them)
   * -    Check that username field is not an empty value - "Username is a required field"
   * -    Check that password field is not an empty value - "Password is a required field"
   */
  

  // TODO: CRIO_TASK_MODULE_LOGIN - Persist user's login information
  /**
   * Store the login information so that it can be used to identify the user in subsequent API calls
   *
   * @param {string} token
   *    API token used for authentication of requests after logging in
   * @param {string} username
   *    Username of the logged in user
   * @param {string} balance
   *    Wallet balance amount of the logged in user
   *
   * Make use of localStorage: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
   * -    `token` field in localStorage can be used to store the Oauth token
   * -    `username` field in localStorage can be used to store the username that the user is logged in as
   * -    `balance` field in localStorage can be used to store the balance amount in the user's wallet
   */
  const persistLogin = (token, username, balance) => {
    localStorage.setItem("token", token)
    localStorage.setItem("username", username)
    localStorage.setItem("balance", balance)
  };

 

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      minHeight="100vh"
    >
      <Header hasHiddenAuthButtons />
      <Box className="content">
        <Stack spacing={2} className="form">
          <h2>Login</h2>
          <TextField
            id="username"
            label="Username"
            variant="outlined"
            title="Username"
            name="username"
            value={userInput.username}
            onChange={handleInput}
            placeholder="Enter username" 
            fullWidth
          /> 
          
          <TextField
            id="password"
            type="password"
            label="Password"
            variant="outlined"
            title="Password"
            name="password"
            value={userInput.password}
            onChange={handleInput}
            placeholder="Enter password"
            fullWidth
          />
          {isLoading? (<Box className="load-icon"><CircularProgress /></Box>): 
          (<Button className="button" variant="contained" onClick={()=>{login(userInput)}} >
            LOGIN TO QKART
          </Button>)}
          

          <p className="secondary-action">
            Don't have an account?{" "}
            <Link to="/register">Register now</Link>
          </p>
        </Stack>
      </Box>
      <Footer />
    </Box>
  );
};

export default Login;
