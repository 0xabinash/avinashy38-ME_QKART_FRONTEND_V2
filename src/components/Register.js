import { Button, CircularProgress, Stack, TextField } from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useState, useEffect } from "react";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";
import "./Register.css";
import { useHistory, Link } from "react-router-dom";

const Register = () => {
  const { enqueueSnackbar } = useSnackbar();
  const history = useHistory()


  // TODO: CRIO_TASK_MODULE_REGISTER - Implement the register function
  /**
   * Definition for register handler
   * - Function to be called when the user clicks on the register button or submits the register form
   *
   * @param {{ username: string, password: string, confirmPassword: string }} formData
   *  Object with values of username, password and confirm password user entered to register
   *
   * API endpoint - "POST /auth/register"
   *
   * Example for successful response from backend for the API call:
   * HTTP 201
   * {
   *      "success": true,
   * }
   *
   * Example for failed response from backend for the API call:
   * HTTP 400
   * {
   *      "success": false,
   *      "message": "Username is already taken"
   * }
   */
  const inputInitialValue = {username: "", password:"", confirmPassword:""}
  const [formInput, setFormInput] = useState(inputInitialValue);
  const [isLoading, setIsLoading] = useState(false);

  const handleInput = (event) => {
    const {name, value} = event.target
    setFormInput((prevInput) => ({
      ...prevInput, [name]: value
    }))
  }
  
  const register =  async(formData) => {
    setIsLoading(true)
    const url = `${config.endpoint}/auth/register`
    const resetInput = {username: "", password:"", confirmPassword:""};
    const data = {
      "username": formData.username, 
      "password": formData.password
    };
    try{
      let result = await axios.post(url, data)
      setIsLoading(false)
      if(result.status === 201){
        enqueueSnackbar("Registered successfully", {variant: "success"})
      }
      setFormInput(resetInput)
      history.push("/login")

    } catch(err){
      setIsLoading(false)
      const error1 = "Username is already taken"
      const error2 = "Something went wrong. Check that the backend is running, reachable and returns valid JSON."
      enqueueSnackbar((err.response && err.response.status === 400) ? error1 : error2 , {variant: "error"})
    }
  };

  const validateInput = (data) => {
    const errors = {};
    if(data.username === "" || data.username.length < 6){
      errors.username = data.username === "" ? "Username is a required field" : "Username must be at least 6 charactors";
      
    }

    if(data.password === "" || data.password.length < 6){
      errors.password = data.password === "" ? "Password is a required field" : "Password must be at least 6 charactors"; 
      
    }
    
    if(data.password !== data.confirmPassword){
      errors.confirmPassword = "Passwords do not match";
     
    }
    return errors;
  };

  const submitData = ()=>{
    const errorData = validateInput(formInput)
    if(Object.keys(errorData).length === 0){
      register(formInput);
    }
    else{
      if(errorData.username){
        enqueueSnackbar(errorData.username, {variant: "warning"})
      }
      if(errorData.password){
        enqueueSnackbar(errorData.password, {variant: "warning"})
      }
      if(errorData.confirmPassword){
        enqueueSnackbar(errorData.confirmPassword, {variant: "warning"})
      }
    }
  }

  // TODO: CRIO_TASK_MODULE_REGISTER - Implement user input validation logic
  /**
   * Validate the input values so that any bad or illegal values are not passed to the backend.
   *
   * @param {{ username: string, password: string, confirmPassword: string }} data
   *  Object with values of username, password and confirm password user entered to register
   *
   * @returns {boolean}
   *    Whether validation has passed or not
   *
   * Return false if any validation condition fails, otherwise return true.
   * (NOTE: The error messages to be shown for each of these cases, are given with them)
   * -    Check that username field is not an empty value - "Username is a required field"
   * -    Check that username field is not less than 6 characters in length - "Username must be at least 6 characters"
   * -    Check that password field is not an empty value - "Password is a required field"
   * -    Check that password field is not less than 6 characters in length - "Password must be at least 6 characters"
   * -    Check that confirmPassword field has the same value as password field - Passwords do not match
   */

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
          <h2 className="title">Register</h2>
          <TextField
            id="username"
            label="Username"
            variant="outlined"
            title="Username"
            name="username"
            value={formInput.username}
            onChange={handleInput}
            placeholder="Enter Username"
            fullWidth
          />
          <TextField
            id="password"
            variant="outlined"
            label="Password"
            name="password"
            type="password"
            helperText="Password must be atleast 6 characters length"
            fullWidth
            placeholder="Enter a password with minimum 6 characters"
            value={formInput.password}
            onChange={handleInput}
          />
          <TextField
            id="confirmPassword"
            variant="outlined"
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            fullWidth
            value={formInput.confirmPassword}
            onChange={handleInput}
          />
          {isLoading? (<Box className="load-icon"><CircularProgress /></Box>): (
            <Button className="button" variant="contained" onClick={submitData}>
            Register Now
           </Button>
          )}
           
          <p className="secondary-action">
            Already have an account?{" "}
             <Link to="/login">
              Login here
             </Link>
          </p>
        </Stack>
      </Box>
      <Footer />
    </Box>
  );
};

export default Register;
