exports.calculateTotalPrice = (items_array) => {
    let total_price = 0;
    for(let i = 0; i < items_array.length; i++){
        total_price = total_price + (items_array[i].price * items_array[i].quantity);
    }

    return total_price;
  }