// Унифицируем ключ для хранения корзины
const CART_KEY = 'cart';

// Функция для получения содержимого корзины
function getCart() {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
}

// Функция для сохранения корзины
function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

// Функция для обновления счетчика корзины в хедере
function updateCartCounter() {
    const cart = getCart();
    const totalItems = cart.reduce((total, item) => total + (item.quantity || 1), 0);
    document.querySelectorAll('.cart-counter').forEach(counter => {
        counter.textContent = totalItems;
    });
}

// Функция для добавления товара в корзину
function addToCart(product) {
    const cart = getCart();
    
    // Проверяем, есть ли уже такой товар в корзине
    const existingItemIndex = cart.findIndex(item => item.id === product.id);
    
    if (existingItemIndex >= 0) {
        // Если товар уже есть, увеличиваем количество
        cart[existingItemIndex].quantity += product.quantity || 1;
    } else {
        // Если товара нет, добавляем новый
        cart.push({
            ...product,
            quantity: product.quantity || 1
        });
    }
    
    // Сохраняем обновленную корзину
    saveCart(cart);
    
    // Обновляем счетчик в хедере
    updateCartCounter();
    
    // Показываем анимацию добавления
    const button = event.target.closest('.cyber-button');
    if (button) {
        button.classList.add('item-added');
        setTimeout(() => {
            button.classList.remove('item-added');
        }, 500);
    }
    
    return false;
}

// Функция для отображения товаров в корзине
function displayCartItems() {
    const cart = getCart();
    const cartItemsList = document.querySelector('.cart-items-list');
    const cartEmpty = document.querySelector('.cart-empty');
    const subtotalElement = document.querySelector('.subtotal');
    const grandTotalElement = document.querySelector('.grand-total');
    
    if (cart.length === 0) {
        if (cartItemsList) cartItemsList.style.display = 'none';
        if (cartEmpty) cartEmpty.style.display = 'flex';
        if (subtotalElement) subtotalElement.textContent = '0 ₽';
        if (grandTotalElement) grandTotalElement.textContent = '0 ₽';
        return;
    }
    
    if (cartItemsList) {
        cartItemsList.style.display = 'block';
        cartEmpty.style.display = 'none';
        
        // Очищаем список перед обновлением
        cartItemsList.innerHTML = '';
        
        let subtotal = 0;
        
        // Добавляем каждый товар в список
        cart.forEach((item, index) => {
            const itemElement = document.createElement('div');
            itemElement.className = 'service-item'; // Используем стиль service-item
            itemElement.innerHTML = `
                <div class="service-item" style="width: 100%;">
                    <div class="service-image" style="width: 120px; height: 120px;">
                        <img src="${item.image || 'pic/default-component.jpg'}" alt="${item.name}">
                        <div class="image-overlay"></div>
                    </div>
                    <div class="service-info" style="flex: 1; padding: 15px;">
                        <h3>${item.name}</h3>
                        <p>${item.description || 'Высокопроизводительный компонент'}</p>
                        <div class="service-tech">
                            ${(item.specs || ['Компьютерные комплектующие']).map(spec => `<span>${spec}</span>`).join('')}
                        </div>
                    </div>
                    <div class="item-quantity" style="display: flex; align-items: center; gap: 5px; padding: 0 15px;">
                        <button class="quantity-btn cyber-button small minus"><i class="fas fa-minus"></i></button>
                        <input type="number" value="${item.quantity}" min="1" class="quantity-input" style="width: 50px;">
                        <button class="quantity-btn cyber-button small plus"><i class="fas fa-plus"></i></button>
                    </div>
                    <div class="item-price" style="padding: 0 15px; min-width: 100px; text-align: right;">
                        <span class="price-value">${(item.price * item.quantity).toLocaleString('ru-RU')} ₽</span>
                    </div>
                    <div class="item-remove" style="padding: 0 15px;">
                        <button class="remove-btn cyber-button small danger"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            `;
            
            cartItemsList.appendChild(itemElement);
            
            // Добавляем обработчики событий для кнопок
            const minusBtn = itemElement.querySelector('.minus');
            const plusBtn = itemElement.querySelector('.plus');
            const quantityInput = itemElement.querySelector('.quantity-input');
            const removeBtn = itemElement.querySelector('.remove-btn');
            
            minusBtn?.addEventListener('click', () => {
                if (item.quantity > 1) {
                    item.quantity--;
                    quantityInput.value = item.quantity;
                    updateCartItem(index, item);
                }
            });
            
            plusBtn?.addEventListener('click', () => {
                item.quantity++;
                quantityInput.value = item.quantity;
                updateCartItem(index, item);
            });
            
            quantityInput?.addEventListener('change', () => {
                const newQuantity = parseInt(quantityInput.value) || 1;
                item.quantity = newQuantity < 1 ? 1 : newQuantity;
                quantityInput.value = item.quantity;
                updateCartItem(index, item);
            });
            
            removeBtn?.addEventListener('click', () => {
                const updatedCart = [...cart];
                updatedCart.splice(index, 1);
                saveCart(updatedCart);
                displayCartItems();
                updateCartCounter();
            });
            
            subtotal += item.price * item.quantity;
        });
        
        // Обновляем итоговые суммы
        if (subtotalElement) subtotalElement.textContent = subtotal.toLocaleString('ru-RU') + ' ₽';
        if (grandTotalElement) grandTotalElement.textContent = subtotal.toLocaleString('ru-RU') + ' ₽';
    }
}
// Функция для обновления товара в корзине
function updateCartItem(index, item) {
    const cart = getCart();
    cart[index] = item;
    saveCart(cart);
    displayCartItems();
    updateCartCounter();
}

// Функция для очистки корзины
function clearCart() {
    saveCart([]);
    displayCartItems();
    updateCartCounter();
}

// Инициализация корзины при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Если это страница корзины, отображаем товары
    if (document.querySelector('.cart-container')) {
        displayCartItems();
        
        // Обработчик для кнопки очистки корзины
        document.querySelector('.clear-cart')?.addEventListener('click', clearCart);
        
        // Обработчик для кнопки оформления заказа
        document.querySelector('.checkout')?.addEventListener('click', function() {
            alert('Заказ успешно оформлен!');
            clearCart();
        });
    }
    
    // Обработчики для кнопок "В корзину" на страницах товаров
    document.querySelectorAll('.cyber-button').forEach(button => {
        if (button.textContent.includes('В КОРЗИНУ')) {
            button.addEventListener('click', function(event) {
                const card = event.target.closest('.price-category-card');
                if (!card) return;
                
                const product = {
                    id: card.querySelector('h3').textContent.trim(),
                    name: card.querySelector('h3').textContent.trim(),
                    image: card.querySelector('img').src,
                    price: parseInt(card.querySelector('.price').textContent.replace(/\D/g, '')),
                    quantity: 1,
                    specs: Array.from(card.querySelectorAll('.spec-item span')).map(span => span.textContent.trim())
                };
                
                addToCart(product);
                
                // Если мы на странице корзины, обновляем отображение
                if (document.querySelector('.cart-container')) {
                    displayCartItems();
                }
            });
        }
    });
    
    // Обновляем счетчик корзины при загрузке
    updateCartCounter();
});

// Обработчик для кнопки покупки сборки
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('buy-build') || e.target.closest('.buy-build')) {
        const buildId = e.target.dataset?.index || e.target.closest('.buy-build').dataset.index;
        const savedBuilds = JSON.parse(localStorage.getItem('savedBuilds')) || [];
        
        if (buildId >= 0 && buildId < savedBuilds.length) {
            const build = savedBuilds[buildId];
            const cart = getCart();
            
            // Добавляем каждый компонент в корзину
            Object.values(build.components).forEach(component => {
                const existingItem = cart.find(item => item.id === component.id);
                
                if (existingItem) {
                    existingItem.quantity++;
                } else {
                    cart.push({
                        id: component.id,
                        name: component.name,
                        code: `#${component.id}`,
                        image: getComponentImage(component.id),
                        price: component.price,
                        quantity: 1,
                        specs: component.specs
                    });
                }
            });
            
            saveCart(cart);
            updateCartCounter();
            alert('Сборка добавлена в корзину!');
        }
    }
});

// Функция для получения изображения компонента
function getComponentImage(componentId) {
    const type = componentId.substring(0, 3);
    switch(type) {
        case 'cpu': return 'pic/cpu-example.jpg';
        case 'mob': return 'pic/mobo-example.jpg';
        case 'gpu': return 'pic/gpu-example.jpg';
        case 'ram': return 'pic/ram-example.jpg';
        case 'sto': return 'pic/ssd-example.jpg';
        case 'psu': return 'pic/psu-example.jpg';
        case 'cas': return 'pic/case-example.jpg';
        default: return 'pic/default-component.jpg';
    }
}

// Реализация чата с поддержкой
let chatWindow = null;
let chatConnection = null;

function openSupportChat() {
    // Проверяем, не открыт ли уже чат
    if (chatWindow && !chatWindow.closed) {
        chatWindow.focus();
        return;
    }
    
    // Открываем новое окно чата
    chatWindow = window.open('', 'IntelligentPC Support Chat', 'width=500,height=600,resizable=yes,scrollbars=yes');
    
    // Если окно не открылось (из-за блокировщика), предлагаем альтернативу
    if (!chatWindow) {
        alert('Ваш браузер заблокировал всплывающее окно. Пожалуйста, разрешите всплывающие окна для этого сайта или используйте альтернативный способ связи.');
        return;
    }
    
    // HTML для окна чата
    chatWindow.document.write(`
        <!DOCTYPE html>
        <html lang="ru">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Чат с поддержкой - IntelligentPC</title>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
            <style>
                body {
                    font-family: 'Roboto', sans-serif;
                    margin: 0;
                    padding: 0;
                    background-color: #0f0f1a;
                    color: #e0e0e0;
                }
                .chat-container {
                    display: flex;
                    flex-direction: column;
                    height: 100vh;
                }
                .chat-header {
                    background: linear-gradient(135deg, #00f2fe 0%, #4facfe 100%);
                    color: white;
                    padding: 15px;
                    text-align: center;
                    font-weight: bold;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.3);
                }
                .chat-messages {
                    flex: 1;
                    padding: 15px;
                    overflow-y: auto;
                    background-color: rgba(20, 20, 40, 0.7);
                }
                .message {
                    margin-bottom: 15px;
                    max-width: 80%;
                    padding: 10px 15px;
                    border-radius: 18px;
                    line-height: 1.4;
                    position: relative;
                }
                .admin-message {
                    background-color: #2a2a4a;
                    border-bottom-left-radius: 5px;
                    align-self: flex-start;
                }
                .user-message {
                    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
                    color: white;
                    border-bottom-right-radius: 5px;
                    margin-left: auto;
                }
                .chat-input {
                    display: flex;
                    padding: 10px;
                    background-color: #1a1a2e;
                    border-top: 1px solid #4facfe;
                }
                .chat-input textarea {
                    flex: 1;
                    padding: 10px;
                    border: 1px solid #4facfe;
                    border-radius: 20px;
                    background-color: #2a2a4a;
                    color: white;
                    resize: none;
                    height: 50px;
                    outline: none;
                }
                .chat-input button {
                    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
                    color: white;
                    border: none;
                    border-radius: 50%;
                    width: 50px;
                    height: 50px;
                    margin-left: 10px;
                    cursor: pointer;
                    font-size: 18px;
                }
                .chat-status {
                    padding: 10px;
                    text-align: center;
                    background-color: #1a1a2e;
                    color: #00ff88;
                    font-size: 14px;
                }
                .typing-indicator {
                    font-style: italic;
                    color: #aaa;
                    font-size: 13px;
                    margin: 5px 0;
                }
                .timestamp {
                    font-size: 11px;
                    color: #aaa;
                    margin-top: 5px;
                    text-align: right;
                }
            </style>
        </head>
        <body>
            <div class="chat-container">
                <div class="chat-header">
                    <i class="fas fa-headset"></i> Чат с поддержкой IntelligentPC
                </div>
                <div class="chat-status" id="chatStatus">
                    <i class="fas fa-circle"></i> Соединение с оператором...
                </div>
                <div class="chat-messages" id="chatMessages">
                    <div class="message admin-message">
                        <div>Здравствуйте! Спасибо, что обратились в поддержку IntelligentPC. Ожидайте соединения с оператором.</div>
                        <div class="timestamp">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                    </div>
                </div>
                <div class="chat-input">
                    <textarea id="messageInput" placeholder="Введите ваше сообщение..." disabled></textarea>
                    <button id="sendMessage" disabled><i class="fas fa-paper-plane"></i></button>
                </div>
            </div>
            <script>
                // Имитация соединения с оператором
                setTimeout(() => {
                    document.getElementById('chatStatus').innerHTML = '<i class="fas fa-circle"></i> Оператор Алексей на связи';
                    document.getElementById('messageInput').disabled = false;
                    document.getElementById('sendMessage').disabled = false;
                    
                    // Добавляем приветственное сообщение от оператора
                    const messages = document.getElementById('chatMessages');
                    const welcomeMsg = document.createElement('div');
                    welcomeMsg.className = 'message admin-message';
                    welcomeMsg.innerHTML = \`
                        <div>Здравствуйте! Меня зовут Алексей. Чем могу помочь?</div>
                        <div class="timestamp">\${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                    \`;
                    messages.appendChild(welcomeMsg);
                    messages.scrollTop = messages.scrollHeight;
                    
                    // Обработчик отправки сообщений
                    document.getElementById('sendMessage').addEventListener('click', sendMessage);
                    document.getElementById('messageInput').addEventListener('keypress', (e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage();
                        }
                    });
                    
                    function sendMessage() {
                        const input = document.getElementById('messageInput');
                        const message = input.value.trim();
                        if (message) {
                            // Добавляем сообщение пользователя
                            const messages = document.getElementById('chatMessages');
                            const userMsg = document.createElement('div');
                            userMsg.className = 'message user-message';
                            userMsg.innerHTML = \`
                                <div>\${message}</div>
                                <div class="timestamp">\${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                            \`;
                            messages.appendChild(userMsg);
                            input.value = '';
                            messages.scrollTop = messages.scrollHeight;
                            
                            // Имитируем ответ оператора
                            setTimeout(() => {
                                const typing = document.createElement('div');
                                typing.className = 'typing-indicator';
                                typing.textContent = 'Оператор печатает...';
                                messages.appendChild(typing);
                                messages.scrollTop = messages.scrollHeight;
                                
                                setTimeout(() => {
                                    messages.removeChild(typing);
                                    
                                    const responses = [
                                        'Я понял ваш вопрос. Давайте разберемся...',
                                        'Для решения этой проблемы вам нужно...',
                                        'Хороший вопрос! Давайте я объясню...',
                                        'Спасибо за уточнение. В вашем случае...',
                                        'Это стандартная ситуация. Рекомендую...'
                                    ];
                                    
                                    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
                                    
                                    const adminMsg = document.createElement('div');
                                    adminMsg.className = 'message admin-message';
                                    adminMsg.innerHTML = \`
                                        <div>\${randomResponse}</div>
                                        <div class="timestamp">\${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                    \`;
                                    messages.appendChild(adminMsg);
                                    messages.scrollTop = messages.scrollHeight;
                                }, 2000);
                            }, 1000);
                        }
                    }
                }, 3000);
            </script>
        </body>
        </html>
    `);
    
    // Закрываем окно чата при закрытии основной страницы
    window.addEventListener('beforeunload', () => {
        if (chatWindow && !chatWindow.closed) {
            chatWindow.close();
        }
    });
}

// Функция для инициации звонка
function initiatePhoneCall(phoneNumber) {
    // Очищаем номер от всех нецифровых символов
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    
    // Проверяем, мобильное ли это устройство
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
        // На мобильных устройствах используем стандартный tel:
        window.location.href = `tel:${cleanNumber}`;
    } else {
        // На компьютерах предлагаем альтернативные варианты
        const confirmed = confirm(`Это компьютер, звонок через браузер невозможен.\n\nНомер телефона: ${phoneNumber}\n\nСкопировать номер в буфер обмена?`);
        if (confirmed) {
            // Копируем номер в буфер обмена
            navigator.clipboard.writeText(phoneNumber).then(() => {
                alert(`Номер ${phoneNumber} скопирован в буфер обмена. Вы можете вставить его в приложение для звонков.`);
            }).catch(err => {
                console.error('Не удалось скопировать номер: ', err);
                prompt('Скопируйте номер вручную:', phoneNumber);
            });
        }
    }
}

// Обработчик для кнопки звонка
document.getElementById('call-support')?.addEventListener('click', function(event) {
    event.preventDefault();
    const phoneNumber = '+7 (962) 910-91-44';
    initiatePhoneCall(phoneNumber);
});



// Функция для создания тикета
function createSupportTicket() {
    // Здесь можно реализовать форму создания тикета
    // В данном примере просто перенаправляем на страницу тикета
    window.location.href = 'ticket.html';
}

// Обработчики для кнопок поддержки
document.addEventListener('DOMContentLoaded', function() {
    // Чат с поддержкой
    document.getElementById('start-chat')?.addEventListener('click', openSupportChat);
    
    // Создание тикета
    document.getElementById('create-ticket')?.addEventListener('click', createSupportTicket);
    
    // Звонок в поддержку
    document.getElementById('call-support')?.addEventListener('click', function() {
        const phoneNumber = '+7 (962) 910-91-44';
        initiatePhoneCall(phoneNumber);
    });
    
    // AI-ассистент
    document.getElementById('ask-ai')?.addEventListener('click', function() {
        alert('AI-ассистент будет доступен в следующей версии. Пожалуйста, используйте другие способы связи.');
    });
    
    // Обновление статуса
    document.getElementById('refresh-status')?.addEventListener('click', function() {
        const statusElements = document.querySelectorAll('.system-status p');
        statusElements.forEach(el => {
            // Имитируем обновление статуса
            if (Math.random() > 0.2) { // 80% chance status stays the same
                return;
            }
            
            const statusSpan = el.querySelector('.status');
            if (statusSpan) {
                if (statusSpan.classList.contains('warning')) {
                    statusSpan.className = 'status online';
                    statusSpan.innerHTML = '<i class="fas fa-circle"></i> ' + statusSpan.textContent.replace(/^.*- /, '');
                    el.textContent = el.textContent.replace(/ - .*$/, ' - Работает');
                } else {
                    statusSpan.className = 'status warning';
                    statusSpan.innerHTML = '<i class="fas fa-circle"></i> ' + statusSpan.textContent.replace(/^.*- /, '');
                    el.textContent = el.textContent.replace(/ - .*$/, ' - Частичные ограничения');
                }
            }
        });
        
        // Показываем уведомление
        const notification = document.createElement('div');
        notification.style.position = 'fixed';
        notification.style.bottom = '20px';
        notification.style.right = '20px';
        notification.style.backgroundColor = '#4facfe';
        notification.style.color = 'white';
        notification.style.padding = '10px 20px';
        notification.style.borderRadius = '5px';
        notification.style.boxShadow = '0 2px 10px rgba(0,0,0,0.3)';
        notification.style.zIndex = '1000';
        notification.textContent = 'Статус систем обновлен';
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transition = 'opacity 0.5s';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 500);
        }, 3000);
    });
});