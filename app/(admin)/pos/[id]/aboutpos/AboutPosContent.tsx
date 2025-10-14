import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "next/navigation";

import { getDeviceToken } from "@/lib/token";
import { toast } from "sonner";

// Pose (kassa) type
type Pose = {
  id: number;
  name: string;
};

// Stock (obyekt) type
type Stock = {
  id: number;
  name: string;
  organization?: string;
  region?: string;
  poses: Pose[];
  app_version?: string; // ✅ yangi qo'shildi
  gnk_id?: string; // agar shu ham bo'lsa
  status: boolean;
  enable_delay: boolean;
  order_from_site: boolean;
  last_active: string;
  last_synchronize: string;
};

const AboutPosContent = () => {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Stock | null>(null);

  const params = useParams();

  const getOrganization = () => {
    let cancelled = false;

    setLoading(true);
    setError(null);

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    if (getDeviceToken()) {
      myHeaders.append("Device-Token", `Kanstik ${getDeviceToken()}`);
    }

    const requestOptions: RequestInit = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };

    fetch(`${BASE_URL}/v1/admins/pos/${params.id}`, requestOptions)
      .then((response) => response.json())
      .then((result) => {
        if (!cancelled) setData(result ?? null);
        setLoading(false);
        setError(null);
      })
      .catch((e) => {
        const msg =
          e?.response?.data?.message || e?.message || "Yuklashda xatolik";
        if (!cancelled) setError(msg);
        toast.error(msg);
      });

    return () => {
      cancelled = true;
    };
  };

  useEffect(() => {
    getOrganization();
  }, []);

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);

    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");

    return `${day}.${month}.${year}, ${hours}:${minutes}`;
  };
  return (
    <div className="w-full">
      <h1 className="text-md mb-3 bg-bgColor text-black rounded-sm p-2 px-3">
        {t("app.pos.info")}{" "}
      </h1>
      <div className="overflow-auto col-span-6 md:col-span-2  rounded-2xl p-4 flex flex-col gap-2 max-h-[75vh] text-sm">
        <h1 className="text-xl -2 border-secondary py-2 mb-2 font-extrabold">
          {t("app.pos.shop")}
        </h1>
        <table className="md:w-[400px]">
          <tbody>
            <tr>
              <td className="py-1">{t("app.stock.name")} :</td>
              <td className="py-1">{data?.name} </td>
            </tr>
            <tr>
              <td className="py-1">{t("app.pos.app_version")} :</td>
              <td className="py-1">{data?.app_version} </td>
            </tr>
            <tr>
              <td className="py-1">gnk_id :</td>
              <td className="py-1">{data?.gnk_id} </td>
            </tr>
            <tr>
              <td className="py-1">{t("app.pos.status")} :</td>
              <td className="py-1">
                {data?.status ? (
                  <span className="bg-green-500 text-white text-[13px] p-1.5 py-1 rounded-sm">
                    {t("app.pos.active")}
                  </span>
                ) : (
                  <span className="bg-red-500 text-white text-[13px] p-1.5 py-1 rounded-sm">
                    {t("app.pos.inactive")}
                  </span>
                )}
              </td>
            </tr>
            <tr>
              <td className="py-1">{t("app.pos.work_without_module")} :</td>
              <td className="py-1">
                {data?.enable_delay ? (
                  <span className="bg-green-500 text-white text-[13px] p-1.5 py-1 rounded-sm">
                    {t("app.pos.active")}
                  </span>
                ) : (
                  <span className="bg-red-500 text-white text-[13px] p-1.5 py-1 rounded-sm">
                    {t("app.pos.inactive")}
                  </span>
                )}
              </td>
            </tr>
            <tr>
              <td className="py-1">{t("app.pos.orders_from_site")} :</td>
              <td className="py-1">
                {data?.order_from_site ? (
                  <span className="bg-green-500 text-white text-[13px] p-1.5 py-1 rounded-sm">
                    {t("app.pos.active")}
                  </span>
                ) : (
                  <span className="bg-red-500 text-white text-[13px] p-1.5 py-1 rounded-sm">
                    {t("app.pos.inactive")}
                  </span>
                )}
              </td>
            </tr>
            <tr>
              <td className="py-1">{t("app.pos.last_activity")} :</td>
              <td className="py-1">
                {data?.last_active ? formatDate(data.last_active) : "N/A"}
              </td>
            </tr>
            <tr>
              <td className="py-1">{t("app.pos.last_sync")} :</td>
              <td className="py-1">
                {" "}
                {data?.last_synchronize
                  ? formatDate(data.last_synchronize)
                  : "N/A"}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AboutPosContent;
