const app = (() => {
  let _token;
  let _result = [];
  let _error = false;
  let _displayElement = document.getElementById("display");

  const average = (arr) => arr.reduce((p, c) => p + c, 0) / arr.length;

  const initilize = async () => {
    try {
      const response = await fetch("http://localhost:8000/token");

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const data = await response.json();
      _token = data.token;

      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const execute = async () => {
    _displayElement.innerHTML = "loading...";

    for (let i = 0; i < 1000; i++) {
      const startTime = new Date().getTime();
      const response = await fetch("http://localhost:8000/test", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${_token}`,
        },
      });

      if (response.ok) {
        const stopTime = new Date().getTime();
        const totalTime = stopTime - startTime;
        _result.push(totalTime);
      } else {
        _error = true;
        break;
      }
    }

    _displayElement.innerHTML = _error
      ? "there was a problem with the test"
      : `Average over 1000 requests: ${average(_result)}ms`;
  };

  if (initilize()) return {execute};
})();
