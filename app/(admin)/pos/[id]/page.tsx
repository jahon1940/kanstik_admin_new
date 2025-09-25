"use client";

import React, { useEffect, useState } from "react";
import { ChevronDownIcon, ChevronLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import Loading from "@/components/Loading";
import { BASE_URL } from "@/lib/api";
import { getDeviceToken } from "@/lib/token";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";


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
};

export default function Pos() {
  const [data, setData] = useState<Stock | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const params = useParams();
  const router = useRouter();

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
        console.log(result);

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

  // about data

  const about = {
    title: "About Me",
    description:
      "I am a passionate front-end developer with a strong foundation in HTML, CSS, and JavaScript. I specialize in creating responsive and user-friendly web applications using React and Next.js. With experience in version control using Git and a keen eye for design, I strive to deliver high-quality code and seamless user experiences.",
    info: [
      { fieldName: "Name", fieldValue: "Abbosbek" },
      { fieldName: "Phone", fieldValue: "+998 91 161 25 01" },
      { fieldName: "Experience", fieldValue: "4+ years" },
      { fieldName: "Nationality", fieldValue: "Uzbek" },
      { fieldName: "Email", fieldValue: "abbosbekqodirov2501@gmail.com" },
      { fieldName: "Address", fieldValue: "Ferghana, Uzbekistan" },
      { fieldName: "Freelance", fieldValue: "Available" },
      { fieldName: "Languages", fieldValue: "English, Uzbek" },
    ],
  };

  // experience data
  const experience = {
    icon: "/assets/resume/badge.svg",
    title: "My experience",
    description:
      "I have worked on various projects ranging from small business websites to large-scale web applications. My experience includes collaborating with cross-functional teams, implementing responsive designs, and optimizing web performance.",
    items: [
      {
        company: "Tech solutions Inc.",
        position: "Front-end Developer junior",
        duration: "Jan 2020 - dec 2022",
      },
      {
        company: "Tech solutions Inc.",
        position: "Front-end Developer Middle",
        duration: "Jan 2022 - Present",
      },
      {
        company: "Tech solutions Inc.",
        position: "Front-end Developer Middle",
        duration: "Summer 2023 (Internship)",
      },
      {
        company: "Tech solutions Inc.",
        position: "Front-end Developer Middle",
        duration: "Summer 2023 (Internship)",
      },
      {
        company: "Tech solutions Inc.",
        position: "Front-end Developer Middle",
        duration: "Summer 2023 (Internship)",
      },
      {
        company: "Tech solutions Inc.",
        position: "Front-end Developer Middle",
        duration: "Summer 2023 (Internship)",
      },
    ],
  };

  // education data
  const education = {
    icon: "/assets/resume/cap.svg",
    title: "My education",
    description:
      "I have worked on various projects ranging from small business websites to large-scale web applications. My experience includes collaborating with cross-functional teams, implementing responsive designs, and optimizing web performance.",
    items: [
      {
        institution: "Online Courses platforms",
        degree: "Front-end development",
        duration: "2023",
      },
      {
        institution: "Online Courses platforms",
        degree: "Front-end development",
        duration: "2023",
      },
      {
        institution: "Online Courses platforms",
        degree: "Front-end development",
        duration: "2023",
      },
      {
        institution: "Online Courses platforms",
        degree: "Front-end development",
        duration: "2023",
      },
      {
        institution: "Online Courses platforms",
        degree: "Front-end development",
        duration: "2023",
      },
      {
        institution: "Online Courses platforms",
        degree: "Front-end development",
        duration: "2023",
      },
    ],
  };

  // skills data
  const skills = {
    icon: "/assets/resume/cap.svg",
    title: "My skills",
    description:
      "I have worked on various projects ranging from small business websites to large-scale web applications. My experience includes collaborating with cross-functional teams, implementing responsive designs, and optimizing web performance.",
    skillList: [
      {
        icon: "icon",
        name: "HTML",
        level: "90%",
      },
      {
        icon: "icon",
        name: "CSS",
        level: "80%",
      },
      {
        icon: "icon",
        name: "Tailwind CSS",
        level: "70%",
      },
      {
        icon: "icon",
        name: "JavaScript",
        level: "70%",
      },
      {
        icon: "icon",
        name: "React",
        level: "70%",
      },
      {
        icon: "icon",
        name: "Redux",
        level: "60%",
      },
      {
        icon: "icon",
        name: "Next.js",
        level: "60%",
      },
      {
        icon: "icon",
        name: "Firebase",
        level: "60%",
      },
    ],
  };

  const [open, setOpen] = React.useState(false);
  const [date, setDate] = React.useState<Date | undefined>(undefined);
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-primary/40 text-white hover:bg-primary transition-colors cursor-pointer bg-secondary"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <h1 className="text-xl font-semibold">Kompaniya</h1>
      </div>
      <div className=" bg-card">
        <Tabs defaultValue="cashiers">
          <div className="grid gap-6  md:grid-cols-6 ">
            {/* Chap panel */}
            <div className="overflow-auto col-span-6 md:col-span-2 border rounded-2xl p-4 flex flex-col gap-2 max-h-[75vh] text-sm">
              <h1 className="text-xl border-b-2 border-secondary py-2 mb-2 font-extrabold">
                Магазин : Kanstik Guncha
              </h1>
              <h1>Магазин : </h1>
              <h1>Название : {data?.name} </h1>
              <h1>Версия программы : {data?.app_version} </h1>
              <h1>gnk_id : {data?.gnk_id} </h1>
              <h1>
                Статус :{" "}
                {data?.status ? (
                  <span className="bg-green-500 text-white text-[13px] p-1.5 rounded-sm">
                    Активно
                  </span>
                ) : (
                  <span className="bg-red-500 text-white text-[13px] p-1.5 rounded-sm">
                    Неактивно
                  </span>
                )}
              </h1>
              <h1>
                Работа без модуля :{" "}
                {data?.enable_delay ? (
                  <span className="bg-green-500 text-white text-[13px] p-1.5 rounded-sm">
                    Активно
                  </span>
                ) : (
                  <span className="bg-red-500 text-white text-[13px] p-1.5 rounded-sm">
                    Неактивно
                  </span>
                )}
              </h1>
              <h1>
                Заказы с сайта :{" "}
                {data?.order_from_site ? (
                  <span className="bg-green-500 text-white text-[13px] p-1.5 rounded-sm">
                    Активно
                  </span>
                ) : (
                  <span className="bg-red-500 text-white text-[13px] p-1.5 rounded-sm">
                    Неактивно
                  </span>
                )}
              </h1>
              <h1>Последняя активность :</h1>
              <h1 className="border-b-2 border-secondary py-2 mb-2">
                Последняя синхрионизация :
              </h1>
              <TabsList className="flex flex-col w-full  mx-auto xl:mx-0 gap-2 ">
                <TabsTrigger value="cashiers">Кассиры</TabsTrigger>
                <TabsTrigger value="receipts">Чеки</TabsTrigger>
                <TabsTrigger value="payments">Платежи</TabsTrigger>
                <TabsTrigger value="orders">Заказы с сайта</TabsTrigger>
                <TabsTrigger value="discounts">Скидка</TabsTrigger>
              </TabsList>
            </div>

            {/* O‘ng panel */}
            <div className="overflow-auto max-h-[75vh] col-span-6 md:col-span-4 border rounded-2xl p-4">
              {/* content */}
              <div className="min-h-[70vh] w-full">
                {/* cashiers */}
                <TabsContent value="cashiers" className="w-full">
                  <h1 className="text-md mb-3 bg-secondary text-white rounded-sm p-2 px-3">
                    Кассиры{" "}
                  </h1>
                  <Button className="mb-2">Добавить Кассира</Button>
                  <table className="w-full border-t text-sm">
                    <thead className="sticky top-0 z-10 bg-muted">
                      <tr>
                        <th className="text-left font-semibold px-4 py-3 border-b w-[60%]">
                          Nomi
                        </th>
                        <th className="text-left font-semibold px-4 py-3 border-b w-[40%]">
                          Holati
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {loading ? (
                        <tr>
                          <td colSpan={2}>
                            <Loading />
                          </td>
                        </tr>
                      ) : error ? (
                        <tr>
                          <td className="px-4 py-6 text-red-600" colSpan={2}>
                            {error}
                          </td>
                        </tr>
                      ) : !data?.poses?.length ? (
                        <tr>
                          <td
                            className="px-4 py-6 text-muted-foreground"
                            colSpan={2}
                          >
                            Ma&apos;lumot topilmadi
                          </td>
                        </tr>
                      ) : (
                        data.poses.map((org) => (
                          <tr
                            key={org.id}
                            className="hover:bg-accent/50 cursor-pointer"
                            onClick={() => router.push(`/pos/${org.id}`)}
                          >
                            <td className="px-4 py-3">{org.name}</td>
                            <td className="px-4 py-3">
                              <span className="inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300">
                                Aktiv
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </TabsContent>
                {/* receipts */}
                <TabsContent value="receipts" className="w-full">
                  <h1 className="text-md mb-3 bg-secondary text-white rounded-sm p-2 px-3">
                    Чеки{" "}
                  </h1>
                  <div className="flex flex-col gap-3">
                    <div className="flex gap-2">
                      <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            id="date"
                            className="w-48 justify-between font-normal"
                          >
                            {date ? date.toLocaleDateString() : "Select date"}
                            <ChevronDownIcon />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-auto overflow-hidden p-0"
                          align="start"
                        >
                          <Calendar
                            mode="single"
                            selected={date}
                            captionLayout="dropdown"
                            onSelect={(date) => {
                              setDate(date);
                              setOpen(false);
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                      <Button className="mb-2 cursor-pointer">
                        Сформировать Чеки
                      </Button>
                      <Button className="mb-2 cursor-pointer">
                        Скачать отчет
                      </Button>
                      <Button className="mb-2 cursor-pointer">
                        Скачать чеки
                      </Button>
                    </div>
                  </div>

                  {/* <table className="w-full border-t text-sm">
                    <thead className="sticky top-0 z-10 bg-muted">
                      <tr>
                        <th className="text-left font-semibold px-4 py-3 border-b w-[60%]">
                          Nomi
                        </th>
                        <th className="text-left font-semibold px-4 py-3 border-b w-[40%]">
                          Holati
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {loading ? (
                        <tr>
                          <td colSpan={2}>
                            <Loading />
                          </td>
                        </tr>
                      ) : error ? (
                        <tr>
                          <td className="px-4 py-6 text-red-600" colSpan={2}>
                            {error}
                          </td>
                        </tr>
                      ) : !data?.poses?.length ? (
                        <tr>
                          <td
                            className="px-4 py-6 text-muted-foreground"
                            colSpan={2}
                          >
                            Ma&apos;lumot topilmadi
                          </td>
                        </tr>
                      ) : (
                        data.poses.map((org) => (
                          <tr
                            key={org.id}
                            className="hover:bg-accent/50 cursor-pointer"
                            onClick={() => router.push(`/pos/${org.id}`)}
                          >
                            <td className="px-4 py-3">{org.name}</td>
                            <td className="px-4 py-3">
                              <span className="inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300">
                                Aktiv
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table> */}
                </TabsContent>
                {/* payments */}
                <TabsContent value="payments" className="w-full h-full">
                  <h1 className="text-md mb-3 bg-secondary text-white rounded-sm p-2 px-3">
                    Платежи{" "}
                  </h1>

                  <div className="flex gap-2">
                    <Select>
                      <SelectTrigger className="w-[280px]">
                        <SelectValue placeholder="Выберите Платеж" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Выберите 1</SelectLabel>
                          <SelectItem value="est">humo</SelectItem>
                          <SelectItem value="cst">Uzcard</SelectItem>
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel>Выберите 2</SelectLabel>
                          <SelectItem value="gmt">humo</SelectItem>
                          <SelectItem value="cet">Uzcard</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <Button className="mb-2">Добавить Платеж</Button>
                  </div>

                  <table className="w-full border-t text-sm">
                    <thead className="sticky top-0 z-10 bg-muted">
                      <tr>
                        <th className="text-left font-semibold px-4 py-3 border-b w-[60%]">
                          Nomi
                        </th>
                        <th className="text-left font-semibold px-4 py-3 border-b w-[40%]">
                          Holati
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {loading ? (
                        <tr>
                          <td colSpan={2}>
                            <Loading />
                          </td>
                        </tr>
                      ) : error ? (
                        <tr>
                          <td className="px-4 py-6 text-red-600" colSpan={2}>
                            {error}
                          </td>
                        </tr>
                      ) : !data?.poses?.length ? (
                        <tr>
                          <td
                            className="px-4 py-6 text-muted-foreground"
                            colSpan={2}
                          >
                            Ma&apos;lumot topilmadi
                          </td>
                        </tr>
                      ) : (
                        data.poses.map((org) => (
                          <tr
                            key={org.id}
                            className="hover:bg-accent/50 cursor-pointer"
                            onClick={() => router.push(`/pos/${org.id}`)}
                          >
                            <td className="px-4 py-3">{org.name}</td>
                            <td className="px-4 py-3">
                              <span className="inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300">
                                Aktiv
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </TabsContent>
                {/* orders */}
                <TabsContent value="orders" className="w-full h-full">
                  <h1 className="text-md mb-3 bg-secondary text-white rounded-sm p-2 px-3">
                    Заказы с сайта{" "}
                  </h1>

                  <div className="flex flex-col gap-3">
                    <div className="flex gap-2">
                      <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            id="date"
                            className="w-48 justify-between font-normal"
                          >
                            {date ? date.toLocaleDateString() : "Select date"}
                            <ChevronDownIcon />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-auto overflow-hidden p-0"
                          align="start"
                        >
                          <Calendar
                            mode="single"
                            selected={date}
                            captionLayout="dropdown"
                            onSelect={(date) => {
                              setDate(date);
                              setOpen(false);
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                      <Button className="mb-2 cursor-pointer">
                        Сформировать Заказы
                      </Button>
                    </div>
                  </div>

                  {/* <table className="w-full border-t text-sm">
                    <thead className="sticky top-0 z-10 bg-muted">
                      <tr>
                        <th className="text-left font-semibold px-4 py-3 border-b w-[60%]">
                          Nomi
                        </th>
                        <th className="text-left font-semibold px-4 py-3 border-b w-[40%]">
                          Holati
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {loading ? (
                        <tr>
                          <td colSpan={2}>
                            <Loading />
                          </td>
                        </tr>
                      ) : error ? (
                        <tr>
                          <td className="px-4 py-6 text-red-600" colSpan={2}>
                            {error}
                          </td>
                        </tr>
                      ) : !data?.poses?.length ? (
                        <tr>
                          <td
                            className="px-4 py-6 text-muted-foreground"
                            colSpan={2}
                          >
                            Ma&apos;lumot topilmadi
                          </td>
                        </tr>
                      ) : (
                        data.poses.map((org) => (
                          <tr
                            key={org.id}
                            className="hover:bg-accent/50 cursor-pointer"
                            onClick={() => router.push(`/pos/${org.id}`)}
                          >
                            <td className="px-4 py-3">{org.name}</td>
                            <td className="px-4 py-3">
                              <span className="inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300">
                                Aktiv
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table> */}
                </TabsContent>
                {/* discounts */}
                <TabsContent value="discounts" className="w-full h-full">
                  <h1 className="text-md mb-3 bg-secondary text-white rounded-sm p-2 px-3">
                    Скидка{" "}
                  </h1>

                  <table className="w-full border-t text-sm">
                    <thead className="sticky top-0 z-10 bg-muted">
                      <tr>
                        <th className="text-left font-semibold px-4 py-3 border-b w-[60%]">
                          Nomi
                        </th>
                        <th className="text-left font-semibold px-4 py-3 border-b w-[40%]">
                          Holati
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {loading ? (
                        <tr>
                          <td colSpan={2}>
                            <Loading />
                          </td>
                        </tr>
                      ) : error ? (
                        <tr>
                          <td className="px-4 py-6 text-red-600" colSpan={2}>
                            {error}
                          </td>
                        </tr>
                      ) : !data?.poses?.length ? (
                        <tr>
                          <td
                            className="px-4 py-6 text-muted-foreground"
                            colSpan={2}
                          >
                            Ma&apos;lumot topilmadi
                          </td>
                        </tr>
                      ) : (
                        data.poses.map((org) => (
                          <tr
                            key={org.id}
                            className="hover:bg-accent/50 cursor-pointer"
                            onClick={() => router.push(`/pos/${org.id}`)}
                          >
                            <td className="px-4 py-3">{org.name}</td>
                            <td className="px-4 py-3">
                              <span className="inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300">
                                Aktiv
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </TabsContent>
              </div>
            </div>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
