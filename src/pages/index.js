"use client";
import * as tf from "@tensorflow/tfjs";
import { Inter } from "next/font/google";
import { useEffect, useMemo, useState } from "react";
import * as nsfwjs from "nsfwjs";
import Image from "next/image";

tf.enableProdMode();

export default function Home() {
  const [model, setModel] = useState(null);
  const [predictions, setPredictions] = useState(null);

  useEffect(() => {
    nsfwjs.load("/models/quant_nsfw_mobilenet/").then((model) => {
      setModel(model);
    });
  }, []);

  const classify = async () => {
    console.log("onloadeddata");
    if (model) {
      (async () => {
        const image = document.getElementById("img");
        try {
          const result = await model.classify(image);
          console.log("Predictions: ", result);
          setPredictions(result);
        } catch (e) {
          console.log("Error: ", e);
        }
      })();
    }
  };

  const isAllowed = useMemo(() => {
    if (predictions) {
      // average probability value of class name
      const redFlags = ["Hentai", "Sexy", "Porn"];

      const isAllowed = predictions.reduce((acc, curr) => {
        if (redFlags.includes(curr.className)) {
          return acc && curr.probability < 0.5;
        }
        return acc;
      }, true);

      return isAllowed;
    }
    return true;
  }, [predictions]);

  return (
    <main>
      <h1>Next.js + Vite + Tailwind CSS</h1>
      <p>NSFWJS TEST.</p>
      {isAllowed ? "allowed" : "not allowed"}
      <div className="py-2 w-4">
        {model && (
          <Image
            className={!isAllowed ? "blur" : ""}
            width={100}
            height={100}
            onLoadStart={() => setIsLoaded(false)}
            onLoad={async () => await classify()}
            id="img"
            alt="gambar"
            // dummy image from https://picsum.photos/
            src="https://picsum.photos/200/300"
          />
        )}

        {/* render predictions */}
        <ul>
          {predictions &&
            predictions.map((p) => (
              <li key={p.className}>
                {p.className}: {p.probability}
              </li>
            ))}
        </ul>
      </div>
    </main>
  );
}
