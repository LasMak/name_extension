const ethers = new ethers.providers.InfuraProvider('mainnet', 'YOUR_INFURA_PROJECT_ID');

// 监听 popup.js 的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'resolveENS') {
    // 解析 ENS 名称
    ethers.resolveName(message.ens).then(address => {
      if (address) {
        sendResponse({ success: true, address: address });
      } else {
        sendResponse({ success: false });
      }
    }).catch(error => {
      console.error('ENS Resolution Error:', error);
      sendResponse({ success: false });
    });
    return true;  // 异步响应
  }

  if (message.action === 'getQuote') {
    const quoteData = {
      chain: "BSC",  // 这里你可以根据实际需要动态调整
      fromAmount: message.amount,
      fromCurrency: message.fromCurrency,
      toCurrency: message.toCurrency,
      paymentMethodType: "PIX"  // 假设使用的支付方式
    };

    // 使用 fetch 发起 Create Quote 请求
    fetch('https://api.unlimit.com/quotes', {
      method: 'POST',
      headers: {
        'api-key': 'YOUR_API_KEY',
        'signature': 'YOUR_SIGNATURE',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(quoteData)
    })
    .then(response => response.json())
    .then(data => {
      if (data.quoteId) {
        sendResponse({ success: true, quoteId: data.quoteId });
      } else {
        sendResponse({ success: false });
      }
    })
    .catch(error => {
      console.error('Quote Error:', error);
      sendResponse({ success: false });
    });

    return true;  // 异步响应
  }

  if (message.action === 'performPayment') {
    const paymentData = {
      quoteId: "quoteId从getQuote返回", // 使用上一步返回的 quoteId
      fromCurrency: message.fromCurrency,
      toCurrency: message.toCurrency,
      amount: message.amount,
      chain: "BSC",
      paymentMethodType: "PIX",
      depositAddress: message.depositAddress,  // 用户输入的钱包地址
      customerId: "e28f0ce1-da87-4180-93ee-dc542c084fb0",  // 示例 customerId
      onrampTransactionRequiredFieldsJson: {
        full_name: "Test User",
        email: "test123@test.com"
      }
    };

    // 使用 fetch 发起 UNLIMIT 支付请求
    fetch('https://api.unlimit.com/onramp', {
      method: 'POST',
      headers: {
        'api-key': 'YOUR_API_KEY',
        'signature': 'YOUR_SIGNATURE',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(paymentData)
    })
    .then(response => response.json())
    .then(data => {
      if (data.transaction) {
        sendResponse({ success: true, payment_url: data.fiatPaymentInstruction.iban });
      } else {
        sendResponse({ success: false });
      }
    })
    .catch(error => {
      console.error('Payment Error:', error);
      sendResponse({ success: false });
    });

    return true;  // 异步响应
  }
});
