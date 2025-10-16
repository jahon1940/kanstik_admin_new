"use client";
import Loading from "@/components/Loading";
import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { getDeviceToken } from "@/lib/token";
import { useParams, useRouter, useSearchParams } from "next/navigation";
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

import { Eye, EyeOff, X } from "lucide-react";
import { SearchableSelect } from "@/components/ui/searchable-select";
const CashiersContent = () => {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cashiers, setCashiers] = useState<any>(null);
  const [allManagers, setAllManagers] = useState<any>(null);

  const params = useParams();

  const [isAddManagerModalOpen, setIsAddManagerModalOpen] =
    React.useState(false);
  const [selectedCashier, setSelectedCashier] = React.useState<string>("");
  const [selectedRole, setSelectedRole] = React.useState<string>("");
  const [username, setUsername] = React.useState<string>("");
  const [password, setPassword] = React.useState<string>("");
  const [showPassword, setShowPassword] = React.useState<boolean>(false);

  const getCashiers = () => {
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

    fetch(`${BASE_URL}/v1/admins/pos/${params.posId}/managers`, requestOptions)
      .then((response) => response.json())
      .then((result) => {
        if (!cancelled) setCashiers(result ?? null);
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

  const getAllManagers = () => {
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

    fetch(`${BASE_URL}/v1/admins/managers?page=1&page_size=150`, requestOptions)
      .then((response) => response.json())
      .then((result) => {
        if (!cancelled) setAllManagers(result.results ?? null);
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
    getCashiers();
    getAllManagers();
  }, []);

  const handleAddManager = async () => {
    // Validatsiya
    if (!selectedCashier) {
      toast.error(t("app.pos.select_cashier_error"));
      return;
    }
    if (!selectedRole) {
      toast.error(t("app.pos.select_role_error"));
      return;
    }
    if (!username.trim()) {
      toast.error(t("app.pos.username_required"));
      return;
    }
    if (!password.trim()) {
      toast.error(t("app.pos.password_required"));
      return;
    }

    try {
      setLoading(true);

      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");

      if (getDeviceToken()) {
        myHeaders.append("Device-Token", `Kanstik ${getDeviceToken()}`);
      }

      const requestData = {
        manager_id: parseInt(selectedCashier),
        username: username.trim(),
        password: password.trim(),
        role: selectedRole === "cashier" ? "casher" : selectedRole,
      };

      const requestOptions: RequestInit = {
        method: "PUT",
        headers: myHeaders,
        body: JSON.stringify(requestData),
        redirect: "follow",
      };

      const response = await fetch(
        `${BASE_URL}/v1/admins/pos/${params.posId}/set-managers`,
        requestOptions
      );

      if (response.ok || response.status === 204) {
        toast.success(t("app.pos.manager_added_success"));
        setIsAddManagerModalOpen(false);
        // Form-ni tozalash
        setSelectedCashier("");
        setSelectedRole("");
        setUsername("");
        setPassword("");
        // Managerlar ro'yxatini yangilash
        getCashiers();
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData.message || t("app.pos.manager_add_error");
        toast.error(errorMessage);
      }
    } catch (error: any) {
      const msg = error?.message || t("app.pos.manager_add_error");
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="w-full">
      <h1 className="text-md mb-3 bg-bgColor text-black rounded-sm p-2 px-3">
        {t("app.pos.cashiers")}{" "}
      </h1>
      <Button
        className="mb-4 cursor-pointer"
        onClick={() => setIsAddManagerModalOpen(true)}
      >
        {t("app.pos.add_cashier")}
      </Button>

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
              {t("app.company.role")}
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
          ) : !cashiers?.results.length ? (
            <tr>
              <td className="px-4 py-6 text-muted-foreground" colSpan={3}>
                {t("app.company.not_found")}
              </td>
            </tr>
          ) : (
            cashiers?.results.map((org: any, index: number) => (
              <tr key={org.id} className="hover:bg-accent/50 cursor-pointer ">
                <td className="px-2 py-3 w-12 text-center text-sm text-gray-600 border-r border-gray-300">
                  {index + 1}
                </td>
                <td className="px-4 py-3 border-r border-gray-300">
                  {org.name}
                </td>
                <td className="py-1 border-r border-gray-300">
                  <span
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
                      org.role === "admin" && "bg-red-600/20 text-red-600/90"
                    )}
                  >
                    {t(`app.company.${org.role}`)}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      {/* Add Manager Modal */}
      {isAddManagerModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsAddManagerModalOpen(false);
            }
          }}
        >
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gray-50 px-6 py-4  flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800">
                {t("app.pos.cashier_login_data")}
              </h2>
              <button
                onClick={() => setIsAddManagerModalOpen(false)}
                className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground bg-[#ed6b3c68] text-[#ff4400] p-2 cursor-pointer"
              >
                <X className="h-4 w-4 " />
              </button>
            </div>

            {/* Form Content */}
            <div className="p-6 space-y-4">
              {/* Cashier Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("app.pos.select_cashier")}
                </label>
                <SearchableSelect
                  options={
                    allManagers?.map((item: any, index: number) => ({
                      value: item.id ? item.id.toString() : index.toString(), // value faqat string
                      label: item.name,
                    })) || []
                  }
                  value={selectedCashier?.toString() || ""} // bu ham string bo‘lishi shart
                  onValueChange={(val) => setSelectedCashier(val)} // val string bo‘lib keladi
                  placeholder={t("app.pos.select_cashier")}
                  searchPlaceholder={t("app.search")}
                  emptyText={t("app.company.not_found")}
                />
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("app.pos.select_role")}
                </label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("app.pos.select_role")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>{t("app.pos.roles")}</SelectLabel>
                      <SelectItem value="cashier">
                        {t("app.pos.cashier")}
                      </SelectItem>
                      <SelectItem value="admin">
                        {t("app.pos.admin")}
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="username"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ransparent"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="password"
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ransparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="bg-gray-50 px-6 py-4 ">
              <button
                onClick={handleAddManager}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-md font-medium transition-colors"
              >
                {loading ? t("app.pos.adding") : t("app.pos.add_cashier")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CashiersContent;
