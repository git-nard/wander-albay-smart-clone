import Navbar from "@/components/Navbar";
import { PhoneCall } from "lucide-react";

export default function EmergencyHotlines() {
  return (
    <>
      <Navbar />

      <div className="container py-10 text-white">
        <h1 className="text-3xl font-bold flex items-center gap-2 text-cyan-400">
          <PhoneCall className="w-7 h-7 text-orange-500" />
          Emergency Hotlines – Albay
        </h1>

        <p className="mt-3 text-gray-300 text-base">
          In case of emergency, contact the numbers below:
        </p>

        <div className="mt-6 space-y-6 text-lg bg-gray-800/60 p-6 rounded-xl shadow-sm border border-gray-700">
          {/* Provincial / General */}
          <p>
            🚨 <strong>National Emergency:</strong>{" "}
            <span className="text-cyan-400 font-semibold">911</span>
          </p>
          <p>
            🚓 <strong>PNP – Albay Province:</strong>{" "}
            <span className="text-cyan-400 font-semibold">0998-598-5926</span>
          </p>
          <p>
            🔥 <strong>BFP – Albay Province:</strong>{" "}
            <span className="text-cyan-400 font-semibold">0969-609-7794</span>
          </p>
          <p>
            🛑 <strong>PDRRMC – Albay Province:</strong>{" "}
            <span className="text-cyan-400 font-semibold">(052) 480-5222</span>
          </p>

          <hr className="my-4 border-gray-600" />

          {/* City / Municipality Specific */}
          <h2 className="text-2xl font-semibold text-orange-400">Legazpi City</h2>
          <p>
            📍 <strong>City Emergency (Legazpi 911):</strong>{" "}
            <span className="text-cyan-400 font-semibold">0920-952-8180</span>
          </p>

          <h2 className="text-2xl font-semibold text-orange-400 mt-4">Ligao City</h2>
          <p>
            ☎️ <strong>CDRRMO OPCEN:</strong>{" "}
            <span className="text-cyan-400 font-semibold">0919-078-0730</span>
          </p>
          <p>
            🚑 <strong>EQRT Ligao:</strong>{" "}
            <span className="text-cyan-400 font-semibold">0995-400-4711</span>
          </p>
          <p>
            🚓 <strong>PNP Ligao:</strong>{" "}
            <span className="text-cyan-400 font-semibold">0998-598-5928</span>
          </p>

          <h2 className="text-2xl font-semibold text-orange-400 mt-4">Tabaco City</h2>
          <p>
            📍 <strong>CDRRMO / Ops Center:</strong>{" "}
            <span className="text-cyan-400 font-semibold">0999-475-8582</span>
          </p>
          <p>
            🔥 <strong>Fire Station (BFP Tabaco):</strong>{" "}
            <span className="text-cyan-400 font-semibold">0915-837-5720</span>
          </p>

          <h2 className="text-2xl font-semibold text-orange-400 mt-4">Camalig</h2>
          <p>
            📍 <strong>MDRRMO:</strong>{" "}
            <span className="text-cyan-400 font-semibold">
              0917-809-8823 / 0999-226-5345
            </span>
          </p>

          <h2 className="text-2xl font-semibold text-orange-400 mt-4">Bacacay</h2>
          <p>
            📍 <strong>MDRRMO:</strong>{" "}
            <span className="text-cyan-400 font-semibold">0917-516-0037</span>
          </p>

          <h2 className="text-2xl font-semibold text-orange-400 mt-4">Daraga</h2>
          <p>
            📍 <strong>DCC / MDRRMO:</strong>{" "}
            <span className="text-cyan-400 font-semibold">0906-564-8793</span>
          </p>

          <h2 className="text-2xl font-semibold text-orange-400 mt-4">Guinobatan</h2>
          <p>
            📍 <strong>MDRRMO:</strong>{" "}
            <span className="text-cyan-400 font-semibold">0945-295-2906</span>
          </p>

          <h2 className="text-2xl font-semibold text-orange-400 mt-4">Polangui</h2>
          <p>
            📍 <strong>MDRRMO:</strong>{" "}
            <span className="text-cyan-400 font-semibold">0954-182-0095</span>
          </p>

          <h2 className="text-2xl font-semibold text-orange-400 mt-4">Oas</h2>
          <p>
            📍 <strong>MDRRMO:</strong>{" "}
            <span className="text-cyan-400 font-semibold">0939-083-9955</span>
          </p>

          <h2 className="text-2xl font-semibold text-orange-400 mt-4">Malilipot</h2>
          <p>
            📍 <strong>MDRRMO:</strong>{" "}
            <span className="text-cyan-400 font-semibold">0977-802-3309</span>
          </p>

          <h2 className="text-2xl font-semibold text-orange-400 mt-4">Malinao</h2>
          <p>
            📍 <strong>MDRRMO:</strong>{" "}
            <span className="text-cyan-400 font-semibold">0939-904-5366</span>
          </p>

          <h2 className="text-2xl font-semibold text-orange-400 mt-4">Libon</h2>
          <p>
            📍 <strong>MDRRMO:</strong>{" "}
            <span className="text-cyan-400 font-semibold">0977-840-1884</span>
          </p>

          <h2 className="text-2xl font-semibold text-orange-400 mt-4">Manito</h2>
          <p>
            📍 <strong>MDRRMO:</strong>{" "}
            <span className="text-cyan-400 font-semibold">0912-373-6748</span>
          </p>

          <h2 className="text-2xl font-semibold text-orange-400 mt-4">Pioduran</h2>
          <p>
            📍 <strong>MDRRMO:</strong>{" "}
            <span className="text-cyan-400 font-semibold">0966-395-6804</span>
          </p>

          <h2 className="text-2xl font-semibold text-orange-400 mt-4">Rapu-Rapu</h2>
          <p>
            📍 <strong>MDRRMO:</strong>{" "}
            <span className="text-cyan-400 font-semibold">0948-015-9875</span>
          </p>

          <hr className="my-4 border-gray-600" />

          <p className="text-sm text-gray-400">
            ⚠️ <strong>Note:</strong> These numbers are official hotlines in
            Albay as of the latest public data. Verify updates via the respective
            LGUs’ social media or official websites.
          </p>
        </div>
      </div>
    </>
  );
}
