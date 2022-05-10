import {useEffect, useState} from "react";

export default function Home() {
  const [message, setMessage] = useState("");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    fetch("/api/token").then((response) => {
      if (response.ok) {
        setIsReady(true);
      }
    });
  }, []);

  const average = (arr) => arr.reduce((p, c) => p + c, 0) / arr.length;

  const execute = async () => {
    let result = [];
    let error = false;

    for (let i = 0; i < 1000; i++) {
      const startTime = new Date().getTime();
      const response = await fetch("/api/test");

      if (response.ok) {
        const stopTime = new Date().getTime();
        const totalTime = stopTime - startTime;
        result.push(totalTime);
      } else {
        error = true;
        break;
      }
    }

    if (error) {
      setMessage("something went wrong");
    } else {
      setMessage(`Average over 1000 requests: ${average(result)}ms`);
    }
  };

  return (
    <>
      {!isReady && <p>loading...</p>}
      {isReady && (
        <>
          <p>Frontend httpOnly cookie</p>
          <button onClick={execute}>Execute</button>
          <p>{message}</p>
        </>
      )}
    </>
  );
}
