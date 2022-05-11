const app = (() => {
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

      let request = indexedDB.open("CRM", 1);
      request.onupgradeneeded = (event) => {
        db = event.target.result;

        let store = db.createObjectStore("Authentication", {
          autoIncrement: true,
        });

        let index = store.createIndex("token", "token", {
          unique: true,
        });
      };

      request.onsuccess = (event) => {
        db = event.target.result;
        const txn = db.transaction("Authentication", "readwrite");
        const store = txn.objectStore("Authentication");

        store.put({token: data.token});

        txn.oncomplete = function () {
          db.close();
          return true;
        };
      };
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const execute = async () => {
    _displayElement.innerHTML = "loading...";

    for (let i = 0; i < 1000; i++) {
      const startTime = new Date().getTime();

      const token = await new Promise((resolve, reject) => {
        const request = indexedDB.open("CRM", 1);

        request.onsuccess = (event) => {
          const db = event.target.result;
          const txn = db.transaction("Authentication", "readonly");
          const store = txn.objectStore("Authentication");

          const query = store.get(1);

          query.onerror = async (event) => {
            return reject();
          };

          txn.oncomplete = function () {
            db.close();
          };

          query.onsuccess = async (event) => {
            if (event.target.result) {
              return resolve(event.target.result.token);
            }
          };
        };
      });

      const response = await fetch("http://localhost:8000/test", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const stopTime = new Date().getTime();
        const totalTime = stopTime - startTime;
        _result.push(totalTime);
      } else {
        _error = true;
      }
    }

    _displayElement.innerHTML = _error
      ? "there was a problem with the test"
      : `Average over 1000 requests: ${average(_result)}ms`;
  };

  if (initilize()) return {execute};
})();
