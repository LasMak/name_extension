// 点击"Resolve"按钮后，解析 ENS 名称或验证钱包地址
document.getElementById('resolveBtn').addEventListener('click', async () => {
  const input = document.getElementById('ensInput').value;

  if (!input) {
    document.getElementById('resolvedAddress').textContent = "Please enter a valid ENS name or address.";
    return;
  }

  // 发送消息给 background.js，解析 ENS 名称
  chrome.runtime.sendMessage({ action: 'resolveENS', ens: input }, function(response) {
    if (response.success) {
      document.getElementById('resolvedAddress').textContent = `Resolved Address: ${response.address}`;
    } else {
      document.getElementById('resolvedAddress').textContent = 'Resolution failed.';
    }
  });
});

// 点击"Get Quote"按钮后，生成 Quote ID
document.getElementById('getQuoteBtn').addEventListener('click', async () => {
  const fromCurrency = document.getElementById('fromCurrency').value;
  const toCurrency = document.getElementById('toCurrency').value;
  const amount = document.getElementById('amount').value;

  if (!fromCurrency || !toCurrency || !amount) {
    document.getElementById('quoteResult').textContent = "Please enter all the required fields.";
    return;
  }

  // 向 background.js 发送消息以获取 Quote ID
  chrome.runtime.sendMessage({ 
    action: 'getQuote', 
    fromCurrency: fromCurrency, 
    toCurrency: toCurrency, 
    amount: amount 
  }, function(response) {
    if (response.success) {
      document.getElementById('quoteResult').textContent = `Quote ID: ${response.quoteId}`;
      document.getElementById('payBtn').disabled = false; // 激活支付按钮
    } else {
      document.getElementById('quoteResult').textContent = 'Failed to generate quote.';
    }
  });
});

// 点击"Pay"按钮后，发起支付请求
document.getElementById('payBtn').addEventListener('click', async () => {
  const amount = document.getElementById('amount').value;
  const resolvedAddress = document.getElementById('resolvedAddress').textContent.split(' ')[2];

  // 发起支付请求
  chrome.runtime.sendMessage({ action: 'performPayment', amount: amount, depositAddress: resolvedAddress }, function(response) {
    if (response.success) {
      document.getElementById('paymentResult').textContent = 'Payment initiated. Please follow the instructions to complete the payment.';
    } else {
      document.getElementById('paymentResult').textContent = 'Payment failed. Please try again.';
    }
  });
});
