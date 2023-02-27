import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Avatar, Button, Stack } from "@mui/material";
import {useHistory, Link} from "react-router-dom"
import Box from "@mui/material/Box";
import React from "react";
import "./Header.css";

const Header = ({ children, hasHiddenAuthButtons }) => {
   const history = useHistory();

  const logOut = () => {
    localStorage.removeItem("username")
    localStorage.removeItem("token")
    localStorage.removeItem("balance")
    history.push("/")
    window.location.reload();
  }

  const routToLogin = () => {
    history.push("/login")
  }

  const routToRegister = () => {
    history.push("/register")
  }

  const routeToExplore = () => {
    history.push("/")
  }

  if(hasHiddenAuthButtons){
    return (
      <Box className="header">
        <Box className="header-title">
            <img src="logo_light.svg" alt="QKart-icon"></img>
        </Box>

        <Button
          className="explore-button"
          startIcon={<ArrowBackIcon />}
          variant="text"
          onClick={routeToExplore}
        >
          Back to explore
        </Button>
      </Box>
    );
  }


  return(
    <>
      <Box className="header">
        <Box className="header-title">
            <img src="logo_light.svg" alt="QKart-icon"></img>
        </Box>
        <Stack direction="row" alignItems="center" spacing={1} >
          {localStorage.getItem("username") ? 
          (<>
            <Avatar
             src="avatar.png" 
             sx={{ width: 35, height: 35 }}
             alt={localStorage.getItem("username") || "profile"} />
            <p>{localStorage.getItem("username")}</p>
            <Button onClick={logOut}>Logout</Button>
           </>) : (
            <>
              <Button className="explore-button" variant="text" onClick={routToLogin} >
                Login
              </Button>
              <Button className="explore-button" variant="text" onClick={routToRegister} >
                Register
              </Button>
            </>
           )}
        </Stack>
      </Box> 
    </>
  )
};

export default Header;
