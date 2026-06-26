// Netlify Function: proxy for 0x API
// Needed because 0x blocks CORS for custom headers (0x-api-key) from browsers

exports.handler = async function(event) {
  const params = event.queryStringParameters || {};
  const { sellToken, buyToken, sellAmount, taker } = params;

  if (!sellToken || !buyToken || !sellAmount || !taker) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing required params" })
    };
  }

  const AFFILIATE_WALLET = "0xdf1496a7d0fe0fe557d41d2d5ea7e64ac15d032e";

  const url = new URL("https://api.0x.org/swap/permit2/quote");
  url.searchParams.set("chainId", "8453");
  url.searchParams.set("sellToken", sellToken);
  url.searchParams.set("buyToken", buyToken);
  url.searchParams.set("sellAmount", sellAmount);
  url.searchParams.set("taker", taker);
  // Correct param names for 0x Permit2 API v2
  url.searchParams.set("feeRecipient", AFFILIATE_WALLET);
  url.searchParams.set("feeBps", "15"); // 0.15%

  try {
    const response = await fetch(url.toString(), {
      headers: {
        "0x-api-key": "2a71d5e4-f7cc-4345-be30-72b8400cc5b2",
        "0x-version": "v2"
      }
    });

    const data = await response.json();

    return {
      statusCode: response.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify(data)
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
