

axios.post('http://localhost:3000/api/create-payment-intent', {
  totalPrice: 100,
})
  .then((response) => {
    console.log('Response:', response.data);
  })
  .catch((error) => {
    console.error('Error:', error.response?.data || error.message);
  });
