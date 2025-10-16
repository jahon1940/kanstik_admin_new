"use client";
import Loading from "@/components/Loading";
import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getDeviceToken } from "@/lib/token";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import { useAlertDialog } from "@/contexts/AlertDialogContext";
const PaymentsContent = () => {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const { t } = useTranslation();
  const { showAlert } = useAlertDialog();

  const [paymentTypes, setPaymentTypes] = useState<any>(null);
  const [posPaymentTypes, setPosPaymentTypes] = useState<any>(null);
  const [selectType, setSelectType] = useState<number | null>(null);

  // Modal state for image upload
  const [isImageModalOpen, setIsImageModalOpen] = React.useState(false);
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);
  const [selectedImageFile, setSelectedImageFile] = React.useState<File | null>(
    null
  );
  const [selectedPaymentType, setSelectedPaymentType] =
    React.useState<any>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const params = useParams();

  const getPosPaymentTypes = () => {
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

    fetch(
      `${BASE_URL}/v1/admins/pos/${params.id}/payment-types`,
      requestOptions
    )
      .then((response) => response.json())
      .then((result) => {
        if (!cancelled) setPosPaymentTypes(result.results ?? null);
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

  const getPaymentTypes = () => {
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

    fetch(`${BASE_URL}/v1/admins/payment-types`, requestOptions)
      .then((response) => response.json())
      .then((result) => {
        if (!cancelled) setPaymentTypes(result.results ?? null);
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

  const set_PaymentTypes = () => {
    let cancelled = false;

    setLoading(true);
    setError(null);

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    if (getDeviceToken()) {
      myHeaders.append("Device-Token", `Kanstik ${getDeviceToken()}`);
    }
    const raw = JSON.stringify({
      payment_type_id: selectType,
    });

    const requestOptions: RequestInit = {
      method: "PUT",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    fetch(
      `${BASE_URL}/v1/admins/pos/${params.id}/set-payment-types`,
      requestOptions
    )
      .then((response) => {
        if (response.status == 204) {
          setLoading(false);
          setError(null);
          getPosPaymentTypes();
        }
        // return response.json();
      })
      .then((result) => {
        // if (!cancelled) setPosPaymentTypes(result.results ?? null);
        // setLoading(false);
        // setError(null);
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

  const deletePaymentType = (id: number) => {
    let cancelled = false;

    setLoading(true);
    setError(null);

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    if (getDeviceToken()) {
      myHeaders.append("Device-Token", `Kanstik ${getDeviceToken()}`);
    }
    // const raw = JSON.stringify({
    //   payment_type_id: selectType,
    // });

    const requestOptions: RequestInit = {
      method: "PUT",
      headers: myHeaders,
      body: null,
      redirect: "follow",
    };

    fetch(
      `${BASE_URL}/v1/admins/pos/${params.id}/unset-payment-types/${id}`,
      requestOptions
    )
      .then((response) => {
        if (response.status == 204) {
          setLoading(false);
          setError(null);
          getPosPaymentTypes();
        }
        // return response.json();
      })
      .then((result) => {
        // if (!cancelled) setPosPaymentTypes(result.results ?? null);
        // setLoading(false);
        // setError(null);
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
    getPosPaymentTypes();
    getPaymentTypes();
  }, []);

  const set_TypesImage = (base64: string) => {
    let cancelled = false;

    setLoading(true);
    setError(null);

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    if (getDeviceToken()) {
      myHeaders.append("Device-Token", `Kanstik ${getDeviceToken()}`);
    }
    const raw = JSON.stringify({
      image: base64,
    });

    const requestOptions: RequestInit = {
      method: "PUT",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    fetch(
      `${BASE_URL}/v1/admins/payment-types/${selectedPaymentType.id}`,
      requestOptions
    )
      .then((response) => {
        if (response.status == 204) {
          setLoading(false);
          setError(null);
          toast.success("Изображение успешно загружено!");
          getPosPaymentTypes();
          setIsImageModalOpen(false);
          setSelectedImage(null);
          setSelectedImageFile(null);
          setSelectedPaymentType(null);
        }
        // return response.json();
      })
      .then((result) => {
        // if (!cancelled) setPosPaymentTypes(result.results ?? null);
        // setLoading(false);
        // setError(null);
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
  return (
    <div className="w-full mt-0">
      <div className="space-y-4">
        <h2 className="text-sm md:text-base font-medium bg-bgColor text-black rounded-sm p-2 px-3">
          {t("app.pos.payments")}
        </h2>

        {/* Payment type selector - responsive */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Select
            onValueChange={(value: any) => {
              setSelectType(value);
            }}
          >
            <SelectTrigger className="w-full sm:w-[280px]">
              <SelectValue placeholder="Выберите Платеж" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Выберите</SelectLabel>
                {paymentTypes?.map((item: any) => {
                  return (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
                    </SelectItem>
                  );
                })}
              </SelectGroup>
            </SelectContent>
          </Select>

          <Button
            onClick={() => {
              if (selectType) {
                showAlert({
                  title: "Подтверждение",
                  description:
                    "Вы уверены, что хотите добавить этот способ оплаты?",
                  confirmText: "Да, добавить",
                  cancelText: "Отмена",
                  onConfirm: () => {
                    set_PaymentTypes();
                  },
                  onCancel: () => {
                    console.log("Payment addition cancelled");
                  },
                });
              } else {
                toast.error("выберите тип оплаты");
              }
            }}
            className="cursor-pointer text-sm px-3 py-2"
          >
            {t("app.pos.add_payment")}
          </Button>
        </div>

        <table className="w-full  text-sm">
          <thead className="sticky -top-[1px] z-10 bg-bgColor">
            <tr>
              <th className="text-left font-semibold px-2 py-3 w-12 border-r border-gray-300">
                №
              </th>
              <th className="text-left font-semibold px-4 py-3  w-[60%] border-r border-gray-300">
                {t("app.company.name")}
              </th>
              <th className="text-left font-semibold px-4 py-3  w-[40%] border-r border-gray-300">
                {t("app.company.status")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr>
                <td colSpan={3}>
                  <Loading />
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td className="px-4 py-6 text-red-600" colSpan={3}>
                  {error}
                </td>
              </tr>
            ) : !posPaymentTypes?.length ? (
              <tr>
                <td className="px-4 py-6 text-muted-foreground" colSpan={3}>
                  {t("app.company.not_found")}
                </td>
              </tr>
            ) : (
              posPaymentTypes?.map((org: any, index: number) => (
                <tr key={org.id} className="hover:bg-accent/50 ">
                  <td className="px-2 py-3 w-12 text-center text-sm text-gray-600 border-r border-gray-300">
                    {index + 1}
                  </td>
                  <td className="px-4 py-3 flex items-center gap-2 border-r border-gray-300">
                    <span className="border border-primary rounded-sm p-1">
                      <Image
                        src={
                          org.image_url
                            ? `${BASE_URL}${org.image_url}`
                            : "/images/nophoto.png" // yoki default rasm
                        }
                        width={28}
                        height={28}
                        alt={org.name || "image"}
                        className="w-8 h-8 object-contain"
                      />
                    </span>
                    {org.name}
                  </td>
                  <td className="px-4 py-3 border-r border-gray-300">
                    <div className="flex gap-2">
                      <span
                        onClick={() => {
                          setSelectedPaymentType(org);
                          setIsImageModalOpen(true);
                        }}
                        className="bg-[#6EC8F7] inline-block p-2 rounded-lg cursor-pointer  "
                      >
                        <Image
                          src="/icons/edit.svg"
                          alt="home"
                          width={20}
                          height={20}
                        />
                      </span>
                      <span
                        onClick={() => {
                          showAlert({
                            title: "Подтверждение",
                            description:
                              "Вы уверены, что хотите добавить этот способ оплаты?",
                            confirmText: "Да, добавить",
                            cancelText: "Отмена",
                            onConfirm: () => {
                              deletePaymentType(org.id);
                            },
                            onCancel: () => {
                              console.log("Payment addition cancelled");
                            },
                          });
                        }}
                        className="bg-[#ED6C3C] inline-block p-2 rounded-lg cursor-pointer  "
                      >
                        <Image
                          src="/icons/trash.svg"
                          alt="home"
                          width={20}
                          height={20}
                        />
                      </span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Image Upload Modal */}
      {isImageModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsImageModalOpen(false);
              setSelectedImage(null);
              setSelectedImageFile(null);
              setSelectedPaymentType(null);
            }
          }}
        >
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gray-50 px-6 py-4  flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800">
                Обновить фото для {selectedPaymentType?.name || "CLICK"}
              </h2>
              <button
                onClick={() => {
                  setIsImageModalOpen(false);
                  setSelectedImage(null);
                  setSelectedImageFile(null);
                  setSelectedPaymentType(null);
                }}
                className="text-orange-500 hover:text-orange-700 text-2xl cursor-pointer w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center"
              >
                ×
              </button>
            </div>

            {/* Image Upload Area */}
            <div className="p-6">
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:lue-400 transition-colors relative"
                onClick={() => {
                  const input = document.getElementById(
                    "image-upload"
                  ) as HTMLInputElement;
                  input?.click();
                }}
              >
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setSelectedImageFile(file);
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        setSelectedImage(event.target?.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                {selectedImage ? (
                  <div className="relative">
                    <img
                      src={selectedImage}
                      alt="Selected"
                      className="w-full h-48 object-contain mx-auto rounded"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded opacity-0 hover:opacity-100 transition-opacity">
                      <Image
                        src="/icons/edit.svg"
                        alt="Edit"
                        width={32}
                        height={32}
                        className="w-8 h-8 text-white"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="mx-auto w-16 h-16 mb-4 flex items-center justify-center">
                      <svg
                        className="w-12 h-12 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <p className="text-gray-500 text-sm">
                      Нажмите для выбора изображения
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Button */}
            <div className="bg-gray-50 px-6 py-4 ">
              <button
                onClick={() => {
                  if (selectedImageFile) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      const base64 = event.target?.result as string;
                      set_TypesImage(base64);
                    };
                    reader.readAsDataURL(selectedImageFile);
                  } else {
                    toast.error("Пожалуйста, выберите изображение");
                  }
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-md font-medium transition-colors"
              >
                Обновить фото
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentsContent;
