//1. opening sidebar
document.querySelector('.cart-icon').addEventListener('click', () => {
    document.querySelector('.sidebar').style.width = '250px'
});

//2. closing sidebar
document.querySelector('.close-btn').addEventListener('click', () => {
    document.querySelector('.sidebar').style.width = '0';
});

//3. Nav links
document.querySelector('.link').addEventListener('click', e => {
    e.preventDefault()
})

//4. Creating products
window.addEventListener('load', (event) => {
    console.log('App has started!!!');
    
    fetch('products.json')
        .then(result => result.json())
        .then(data => {
            window.products = data.items

            data.items.forEach(item => {
                const container = document.createElement('div')
                const image = document.createElement('img')
                const icon = document.createElement('i')
                const button = document.createElement('button')
                const productName = document.createElement('div')
                const productPrice = document.createElement('div')
                const items = document.createElement('div')
                const parent = document.getElementById('product-down')

                items.setAttribute('class', 'items')
                container.setAttribute('class', 'item-image-boxes')
                button.setAttribute('class', 'btn-add')
                button.setAttribute('id', `btn-add-${item.sys.id}`)
                button.setAttribute('data-value', item.sys.id) 
                button.setAttribute('price-value', item.fields.price)  
                icon.setAttribute('class', 'fas fa-shopping-cart faas')
                image.setAttribute('src', `${item.fields.image.fields.file.url}`)
                image.setAttribute('alt', 'product-image')
                button.innerText = 'Add To Cart'
                productName.setAttribute('class', 'item-name')
                productPrice.setAttribute('class', 'item-price')
                productName.innerText = `${item.fields.title}`
                productPrice.innerHTML = `<h4>${item.fields.price}</h4>`

                button.appendChild(icon)
                container.appendChild(image)
                container.appendChild(button)
                items.appendChild(container)
                items.appendChild(productName)
                items.appendChild(productPrice)
                parent.appendChild(items)
            })

            if (fetchCart()) {
                fetchCart().forEach(item => {
                    updateCartView(item.itemId, false)
                    const currentButton = document.getElementById(`btn-add-${item.itemId}`)
                    buttonStatus(currentButton)
                })
            }

            const productsContainer = document.getElementById('product-down')
            productsContainer.addEventListener('click', e => {
                e.preventDefault()
                const productId = e.target.getAttribute('data-value')
                const price = e.target.getAttribute('price-value')

                if (productId) {
                    addToCart(productId, price)
                    e.target.innerText = 'In Cart'
                    e.target.disabled = true
                }
            })
        })
});

const fetchCart = () => JSON.parse(localStorage.getItem('cart'))
function setToCart(value) {
    localStorage.setItem('cart', JSON.stringify(value))
}

if (!fetchCart())
    setToCart([])

const returnDefault = (splicedItemId) => {
    const splicedIndex = fetchCart().findIndex(item => item.itemId === splicedItemId)
        document.getElementsByClassName('btn-add')[splicedIndex].innerHTML = 'add 2 Cartdd'
        document.getElementsByClassName('btn-add')[splicedIndex].disabled = false
}

const addToCart = (productId, price) => {
    const cart = fetchCart()
    setToCart([...cart, {itemId: productId, itemPrice: parseFloat(price), quantity: 1}])
    updateCartView(productId)
}

const updateCartView = (productId, adding = true) => {
    const productToBeAdded = window.products.find(product => product.sys.id === productId)
    const currentProduct = fetchCart().find(item => item.itemId === productId)
    const item = document.createElement('li')
    item.setAttribute('class', 'cart-item-list')
    const addToCartHtml = `
        <div class="cart-item">
            <img src=${productToBeAdded.fields.image.fields.file.url} alt="cart-item-image" class="cart-item-img">
            <div class="item-label-div">
                <div class="item-label">
                    <div class="cart-item-name" id="cart-item-name"><h4>${productToBeAdded.fields.title}</h4></div>
                    <div class="cart-item-price" id="cart-item-price"><h4>${productToBeAdded.fields.price}</h4></div>
                    <button class="item-remove-btn" id="remove-btn" remove-btn-count=${productId}>remove</button>
                </div>
                <div class="item-quantity">
                    <button id='up' class="chevron" data-value=${productId}><i id='up' class="fas fa-chevron-up faas" data-value=${productId}></i></button>
                    <span id='item-count-${productId}'>${adding ? '1' : currentProduct.quantity}</span>
                    <button id='down' data-value=${productId} class="chevron"><i id='down' class="fas fa-chevron-down faas" data-value=${productId}></i></button>
                </div>
            </div> 
        </div>
    `
    item.innerHTML = addToCartHtml
    document.getElementById('cart-list').appendChild(item)

    updateCart()
}

const updateCart = () => {
    const cart = fetchCart()
    const cartQuantity = cart.reduce((prev, theItem) => prev + theItem.quantity, 0)
    document.getElementById('carted').innerHTML = cartQuantity

    calcualtePrice()
}

const calcualtePrice = () => {
    const cart = fetchCart()
    const eachProductTotal = cart.map(p => p.itemPrice * p.quantity)
    const cartTotal = eachProductTotal.reduce((acc, item) => acc + item, 0)

    document.querySelector('.total-price').innerHTML = `Total: $${cartTotal.toFixed(2)}`
}

//activating chevron icons
document.getElementById('cart-list').addEventListener('click', event => {
    event.preventDefault()

    if (event.target.getAttribute('id') === 'up') {
        const cart = fetchCart()
        const itemIndex = cart.findIndex(elem => elem.itemId === event.target.getAttribute('data-value'))
        cart[itemIndex] = {...cart[itemIndex], quantity: (cart[itemIndex].quantity + 1)}
        setToCart(cart)
        document.getElementById(`item-count-${event.target.getAttribute('data-value')}`).innerHTML = cart[itemIndex].quantity

        updateCart()
    }

    else if (event.target.getAttribute('id') === 'down') {
        const cart = fetchCart()
        const itemIndex = cart.findIndex(item => item.itemId === event.target.getAttribute('data-value'))
        cart[itemIndex] = {...cart[itemIndex], quantity: (cart[itemIndex].quantity - 1)}
        setToCart(cart)

        document.getElementById(`item-count-${event.target.getAttribute('data-value')}`).innerHTML = cart[itemIndex].quantity

        updateCart()
    }
})

//Activating the remove/delete button
const removeButton = document.getElementById('cart-list')
removeButton.addEventListener('click', e => {
    e.preventDefault()
    
    if (e.target.getAttribute('id') === 'remove-btn') {
        const cart = fetchCart()
        const productIndex = cart.findIndex(element => element.itemId === e.target.getAttribute('remove-btn-count'))    
        const deletedElement = cart.splice(productIndex, 1)
        setToCart(cart)

        //To delete removed item from UI, we say
        const newProductIndex = productIndex + 1 
        removeButton.removeChild(removeButton.childNodes[newProductIndex])
        const disabledButton = document.getElementById(`btn-add-${deletedElement[0].itemId}`)
            if(disabledButton)
                buttonReactivate(disabledButton)

        updateCart()
    }
})

const buttonReactivate = (element) => {
    element.innerHTML = `Add To Cart<i class="fas fa-shopping-cart faas"></i>`
    element.disabled = false
}

const buttonStatus = (button) => {
    button.innerHTML = `In Cart`
    button.disabled = true
}

//Activating the clear cart button
document.querySelector('.clear-cart').addEventListener('click', event => {
    event.preventDefault()
    const cart = fetchCart()
    if (cart.length > 0) {
        const clearCart = cart.splice(0, cart.length)
        setToCart(cart)
        const allCartItem = document.getElementById('cart-list')
        allCartItem.querySelectorAll('.cart-item-list').forEach(n => n.remove())
    }
    if (fetchCart().length === 0) {
        document.querySelectorAll('.btn-add').forEach(item => buttonReactivate(item))
    }
    updateCart()
    
})


