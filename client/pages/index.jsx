import Head from "next/head";
import { useRef, useState } from "react";
import { FaDownload } from "react-icons/fa";
import { BsChevronDown } from "react-icons/bs";
import { toast } from "react-toastify";

export default function Home() {
  const imgRef = useRef(null);
  const resRef = useRef(null);

  const [normal, setNormal] = useState(0);
  const [pneumonia, setPneumonia] = useState(0);

  const [loading, setLoading] = useState(false);

  const [imgData, setImgData] = useState(
    "https://upload.wikimedia.org/wikipedia/commons/c/ca/1x1.png"
  );

  const addPreview = (file) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      setImgData(reader.result);
    });
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    setNormal(0);
    setPneumonia(0);
    setLoading(true);
    const formData = new FormData();
    formData.append("image", imgRef.current.files[0]);
    toast.promise(
      new Promise(async (resolve, reject) => {
        try {
          const response = await fetch("/api/predict", {
            method: "POST",
            body: formData,
          });
          const data = await response.json();
          if (data.success) {
            setNormal(data.data?.normal);
            setPneumonia(data.data?.pneumonia);
            resolve(`Success`);
            setLoading(false);
            //scroll to a div
            resRef.current.scrollIntoView({
              behavior: "smooth",
            });
          } else {
            reject("Error: " + data.message);
            setLoading(false);
          }
        } catch (error) {
          reject("Error: " + error.message || error);
          setLoading(false);
        }
      }),
      {
        pending: "Uploading...",
        success: {
          render: ({ data }) => {
            return `${data}`;
          },
        },
        error: {
          render: ({ data }) => {
            return `${data}`;
          },
        },
      }
    );
  };

  return (
    <>
      <Head>
        <title>Pneumonia Detector</title>
      </Head>
      <main className="flex flex-col justify-center items-center min-h-screen select-none px-4 py-16">
        <h1 className="text-5xl font-bold text-center">Pneumonia Detector</h1>
        <p className="mt-4 font-light text-center">
          This demo uses Tensorflow.js to predict pneumonia from x-ray images.
        </p>
        <label className="relative mt-8 h-80 w-80 border border-slate-50 rounded-xl shadow-lg shadow-slate-800 flex justify-center items-center cursor-pointer hover:shadow-xl hover:shadow-slate-800 transition-all duration-300 overflow-hidden">
          <p className="text-sm opacity-80">Click to upload a file</p>
          <input
            ref={imgRef}
            type="file"
            className="opacity-0 absolute top-0 left-0 w-full h-full cursor-pointer"
            onChange={(e) => addPreview(e.target.files[0])}
          />
          <img
            src={imgData}
            alt=" "
            className="pointer-events-none absolute top-0 left-0 w-full h-full object-cover object-center"
          />
        </label>
        <button
          className="bg-slate-50 text-slate-900 font-bold py-2 px-8 rounded-md mt-6 hover:shadow-xl hover:shadow-slate-800 transition-all duration-300"
          onClick={() => {
            handleUpload();
          }}
          style={{
            opacity: loading ? 0.5 : 1,
            pointerEvents: loading ? "none" : "all",
          }}
        >
          Predict
        </button>
        <a
          className="fixed right-8 bottom-6 opacity-80 hover:opacity-100 transition-all duration-300 flex items-center gap-2"
          href="/Validation-Set.zip"
          target="_blank"
        >
          <FaDownload />
          Download Example Images
        </a>
        {normal > 0 && pneumonia > 0 && (
          <>
            <h3
              className="pt-8 font-bold text-4xl flex gap-4 items-center"
              ref={resRef}
            >
              <BsChevronDown size={24} />
              Prediction Result
              <BsChevronDown size={24} />
            </h3>
            <p className="mt-4 text-xl font-bold">
              <span className="text-emerald-400">{normal}% Normal</span> |{" "}
              <span className="text-red-400">{pneumonia}% Pneumonia</span>
            </p>
            <div
              className="w-full flex flex-col justify-center items-center p-8"
              style={{
                height: "80vh",
              }}
            >
              <div className="w-full h-full max-w-screen-lg">
                <Chart
                  data={[
                    {
                      name: "Result",
                      Normal: normal,
                      Pneumonia: pneumonia,
                    },
                  ]}
                />
              </div>
            </div>
          </>
        )}
      </main>
    </>
  );
}

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Legend,
} from "recharts";

const Chart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart width={400} height={400} data={data}>
        <XAxis dataKey="name" />
        <YAxis />
        {/* <Tooltip /> */}
        <Legend />
        <Bar dataKey="Normal" fill="#34d399" />
        <Bar dataKey="Pneumonia" fill="#f87171" />
      </BarChart>
    </ResponsiveContainer>
  );
};
