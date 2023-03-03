import { Search, SentimentDissatisfied } from "@mui/icons-material";
import {
  CircularProgress,
  Grid,
  InputAdornment,
  TextField,
} from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";
import "./Products.css";
import ProductCard from "./ProductCard"
import Cart, {generateCartItemsFrom} from "./Cart"


// Definition of Data Structures used
/**
 * @typedef {Object} CartItem -  - Data on product added to cart
 * 
 * @property {string} name - The name or title of the product in cart
 * @property {string} qty - The quantity of product added to cart
 * @property {string} category - The category that the product belongs to
 * @property {number} cost - The price to buy the product
 * @property {number} rating - The aggregate rating of the product (integer out of five)
 * @property {string} image - Contains URL for the product image
 * @property {string} productId - Unique ID for the product
 */


const Products = () => {
  const {enqueueSnackbar} = useSnackbar()

  const [filteredProducts, setFilteredProducts] = useState([]) 
  const [products, setProducts] = useState([]) // list of all the products
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [debounceTimeout, setDebounceTimeout] = useState();
  const [items, setItems] = useState([]); // cart items
  const token = localStorage.getItem("token") // fetching the session token

  // TODO: CRIO_TASK_MODULE_PRODUCTS - Fetch products data and store it
  /**
   * Make API call to get the products list and store it to display the products
   *
   * @returns { Array.<Product> }
   *      Array of objects with complete data on all available products
   *
   * API endpoint - "GET /products"
   *
   * Example for successful response from backend:
   * HTTP 200
   * [
   *      {
   *          "name": "iPhone XR",
   *          "category": "Phones",
   *          "cost": 100,
   *          "rating": 4,
   *          "image": "https://i.imgur.com/lulqWzW.jpg",
   *          "_id": "v4sLtEcMpzabRyfx"
   *      },
   *      {
   *          "name": "Basketball",
   *          "category": "Sports",
   *          "cost": 100,
   *          "rating": 5,
   *          "image": "https://i.imgur.com/lulqWzW.jpg",
   *          "_id": "upLK9JbQ4rMhTwt4"
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 500
   * {
   *      "success": false,
   *      "message": "Something went wrong. Check the backend console for more details"
   * }
   */
  const performAPICall = async () => {
    setLoadingProducts(true)
    const url = `${config.endpoint}/products`
    try{
      const response = await axios.get(url)
      
      setLoadingProducts(false)
      setFilteredProducts(response.data)
      setProducts(response.data)
      return response.data;
    } catch(err){
      if(err.response.status === 500){
        enqueueSnackbar("Something went wrong. Check the backend console for more details", {variant: "error"})
      }
      setLoadingProducts(false)
    }
  };


  // TODO: CRIO_TASK_MODULE_PRODUCTS - Implement search logic
  /**
   * Definition for search handler
   * This is the function that is called on adding new search keys
   *
   * @param {string} text
   *    Text user types in the search bar. To filter the displayed products based on this text.
   *
   * @returns { Array.<Product> }
   *      Array of objects with complete data on filtered set of products
   *
   * API endpoint - "GET /products/search?value=<search-query>"
   *
   */
  const performSearch = async (text) => {
    setFilteredProducts("")
    const url = `${config.endpoint}/products/search?value=${text}`
    setLoadingProducts(true)
    try{
      const response = await axios.get(url)

      setFilteredProducts(response.data)
      setLoadingProducts(false)
    } catch(error){
      setLoadingProducts(false)
      if(error.response.status === 404){
        enqueueSnackbar(error.response.statusText, {variant: "error"})
        // console.log(err.response.statusText)
      }

    }

  };

  // TODO: CRIO_TASK_MODULE_PRODUCTS - Optimise API calls with debounce search implementation
  /**
   * Definition for debounce handler
   * With debounce, this is the function to be called whenever the user types text in the searchbar field
   *
   * @param {{ target: { value: string } }} event
   *    JS event object emitted from the search input field
   *
   * @param {NodeJS.Timeout} debounceTimeout
   *    Timer id set for the previous debounce call
   *
   */
  const debounceSearch = (event, debounceTimeout) => {
    const searchText = event.target.value;

    if(debounceTimeout){
      clearTimeout(debounceTimeout)
    }

    let timeOutId = setTimeout(()=>{
      performSearch(searchText)
    }, 500)
    setDebounceTimeout(timeOutId);
  };


    /**
   * Perform the API call to fetch the user's cart and return the response
   *
   * @param {string} token - Authentication token returned on login
   *
   * @returns { Array.<{ productId: string, qty: number }> | null }
   *    The response JSON object
   *
   * Example for successful response from backend:
   * HTTP 200
   * [
   *      {
   *          "productId": "KCRwjF7lN97HnEaY",
   *          "qty": 3
   *      },
   *      {
   *          "productId": "BW0jAAeDJmlZCF8i",
   *          "qty": 1
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 401
   * {
   *      "success": false,
   *      "message": "Protected route, Oauth2 Bearer token not found"
   * }
   */

     const fetchCart = async (token) => {
      if (!token) return;
      const url = `${config.endpoint}/cart`
  
      try {
        // TODO: CRIO_TASK_MODULE_CART - Pass Bearer token inside "Authorization" header to get data from "GET /cart" API and return the response data
        const response = await axios.get(url,{
          headers: {Authorization: `Bearer ${token}`},
        })
        return response.data;
        // return fetchCartMock;
        
      } catch (error) {
        if (error.response && error.response.status === 400) {
          enqueueSnackbar(error.response.data.message, { variant: "error" });
        } else {
          enqueueSnackbar(
            "Could not fetch cart details. Check that the backend is running, reachable and returns valid JSON.",
            {variant: "error"}
            );
        }
        return null;
      }
    };


    useEffect(()=>{
      const callBack = async()=>{
        const productData = await performAPICall();
        const cartData = await fetchCart(token)
        const cartItems = await generateCartItemsFrom(cartData, productData);
        setItems(cartItems);
      }
      callBack()
    },[])


      // TODO: CRIO_TASK_MODULE_CART - Return if a product already exists in the cart
  /**
   * Return if a product already is present in the cart
   *
   * @param { Array.<{ productId: String, quantity: Number }> } items
   *    Array of objects with productId and quantity of products in cart
   * @param { String } productId
   *    Id of a product to be checked
   *
   * @returns { Boolean }
   *    Whether a product of given "productId" exists in the "items" array
   *
   */
  const isItemInCart = (items, productId) => {
    const isPresent = items.find((item) => {
      return item.productId === productId;
    })

    if(isPresent === undefined){
      return false
    }
    else{
      return true
    }
  };

  /**
   * Perform the API call to add or update items in the user's cart and update local cart data to display the latest cart
   *
   * @param {string} token
   *    Authentication token returned on login
   * @param { Array.<{ productId: String, quantity: Number }> } items
   *    Array of objects with productId and quantity of products in cart
   * @param { Array.<Product> } products
   *    Array of objects with complete data on all available products
   * @param {string} productId
   *    ID of the product that is to be added or updated in cart
   * @param {number} qty
   *    How many of the product should be in the cart
   * @param {boolean} options
   *    If this function was triggered from the product card's "Add to Cart" button
   *
   * Example for successful response from backend:
   * HTTP 200 - Updated list of cart items
   * [
   *      {
   *          "productId": "KCRwjF7lN97HnEaY",
   *          "qty": 3
   *      },
   *      {
   *          "productId": "BW0jAAeDJmlZCF8i",
   *          "qty": 1
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 404 - On invalid productId
   * {
   *      "success": false,
   *      "message": "Product doesn't exist"
   * }
   */
  const addToCart = async (token, items, products, productId, qty, options = { preventDuplicate: false }) => {
    if(!token){
      enqueueSnackbar("Login to add an item to the cart", {variant: "warning"})
      return;
    }

    if(options.preventDuplicate && isItemInCart(items, productId)){
      const warning = "Item already in cart. Use the cart sidebar to upadte quantity or remove item";

      enqueueSnackbar(warning, {variant: "warning"})

      return;
    }

    const url = `${config.endpoint}/cart`;
    try{
      const response = await axios.post(url,{productId, qty}, {
        headers: {Authorization: `Bearer ${token}`}
      });
      const cartItems = generateCartItemsFrom(response.data, products)
      setItems(cartItems);

    } catch(error){
      if(error.response){
        enqueueSnackbar(error.response.message, {variant: "error"})
      }
      else{
        const error = "Could not fetch cart details. Check that the backend is running, reachable and returns valid JSON."
        enqueueSnackbar(error, {variant: "error"})
      }
    }
  };


  return (
    <div>
      <Header >
        {/* TODO: CRIO_TASK_MODULE_PRODUCTS - Display search bar in the header for Products page */}
          <TextField
            className="search-desktop"
            size="small"
            InputProps={{
              className: "search",
              endAdornment: (
                <InputAdornment position="end">
                  <Search color="primary" />
                </InputAdornment>
              ),
            }}
            placeholder="Search for items/categories"
            name="search"
            onChange={(event) => debounceSearch(event, debounceTimeout)}
          />
          
      </Header>

      {/* Search view for mobiles */}
      <TextField
        className="search-mobile"
        size="small"
        fullWidth
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Search color="primary" />
            </InputAdornment>
          ),
        }}
        placeholder="Search for items/categories"
        name="search"
        onChange={(event) => debounceSearch(event, debounceTimeout)}
      />
       <Grid container >
         <Grid item className="product-grid" md={token && items.length ? 9: 12}>
           <Box className="hero">
             <p className="hero-heading">
               India’s <span className="hero-highlight">FASTEST DELIVERY</span>{" "}
               to your door step
             </p>
           </Box>

           {loadingProducts? (
            <Box className="loading" >
              <CircularProgress />
              <h4>Loading Products...</h4>
            </Box>
            ) : (
            <Grid container spacing={2} paddingX="1rem" marginY="1rem">
             {filteredProducts.length? (filteredProducts.map((product)=>{
              return(
                <Grid item lg={3} md={6} sm={4} xs={12} key={product._id}>
                  <ProductCard product={product} 
                  handleAddToCart={
                    async () => {
                      await addToCart(token, items, products, product._id, 1, {preventDuplicate: true})
                    }
                  }
                  />
                </Grid>
                )})) : (
              <Box className="loading">
                <SentimentDissatisfied />
                <h4>NO PRODUCTS FOUND</h4>
              </Box>
             )}) 
            </Grid>
           )}
        </Grid>
          {token && (
          <Grid item md={3} xs={12} bgcolor="#E9F5E1">
            <Cart
            hasCheckoutButton
            products={products} 
            items={items}
            handleQuantity={addToCart}
            />
          </Grid>)}
      </Grid>
       
       
      <Footer />
    </div>
  );
};

export default Products;
