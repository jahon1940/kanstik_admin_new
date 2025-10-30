"use client";

import Loading from "@/components/Loading";
import { Pagination } from "@/components/ui/pagination";
import { getDeviceToken } from "@/lib/token";
import { ChevronLeft, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

// Product type
type Product = {
  id: number;
  title: string;
  classifier_title: string;
  price: number;
  quantity: number;
  remaining: number;
  vendor_code: string;
  image_url?: string;
  name?: string;
  brand?: {
    id: number;
    name: string;
  };
  category?: {
    id: number;
    name: string;
  };
  made_in?: {
    id: number;
    name: string;
  };
  classifier_code?: string;
  measure?: string;
  packagename?: string;
  packagecode?: string;
  stocks?: Array<{
    id: number;
    quantity: number;
    remaining?: number;
    reserved?: number;
    stock: {
      id: number;
      name: string;
      address?: string;
      phone?: string;
    };
  }>;
};

const ProductsPage = () => {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [productSearchQuery, setProductSearchQuery] = React.useState("");
  const [productSearchTimer, setProductSearchTimer] =
    React.useState<NodeJS.Timeout | null>(null);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(
    null
  );
  const [isProductModalOpen, setIsProductModalOpen] = React.useState(false);
  const [activeModalTab, setActiveModalTab] = React.useState<"info" | "stocks">(
    "info"
  );

  const router = useRouter();

  const [productsPagination, setProductsPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    pageSize: 20,
    hasNext: false,
    hasPrevious: false,
  });

  const handleProductSearchInputChange = (value: string) => {
    setProductSearchQuery(value);

    // Clear existing timer
    if (productSearchTimer) {
      clearTimeout(productSearchTimer);
    }

    // Set new timer for debounce (500ms delay)
    const newTimer = setTimeout(() => {
      handleProductSearch(value, 1);
    }, 500);

    setProductSearchTimer(newTimer);
  };

  const handleProductSearch = async (
    searchTerm: string = "",
    page: number = 1
  ) => {
    try {
      setLoading(true);
      const searchData = {
        title: searchTerm,
      };
      await getSearchProducts(searchData, page);
    } catch (error) {
      // Error handled in getSearchProducts
    } finally {
      setLoading(false);
    }
  };

  console.log(selectedProduct?.stocks);

  const getSearchProducts = async (
    searchData: any,
    page: number = 1,
    append: boolean = false
  ) => {
    try {
      setLoading(true);

      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");

      if (getDeviceToken()) {
        myHeaders.append("Device-Token", `Kanstik ${getDeviceToken()}`);
      }

      const requestOptions: RequestInit = {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify(searchData),
        redirect: "follow",
      };

      const response = await fetch(
        `${BASE_URL}/v1/admins/products/search?page=${page}&page_size=20`,
        requestOptions
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || t("app.pos.search_error"));
      }

      if (append && page > 1) {
        // Append new results to existing ones for "Show More" functionality
        setProducts((prevProducts) => [
          ...prevProducts,
          ...(result.results || result || []),
        ]);
      } else {
        // Replace results for normal pagination
        setProducts(result.results || result || []);
      }

      // Update pagination state
      const paginationData = {
        currentPage: result.current_page || result.page || page,
        totalPages:
          result.total_pages ||
          result.totalPages ||
          Math.ceil(
            (result.total || result.count || 0) /
              (result.page_size || result.pageSize || 20)
          ) ||
          1,
        totalItems: result.total_items || result.total || result.count || 0,
        pageSize: result.page_size || result.pageSize || 20,
        hasNext:
          result.has_next ||
          result.hasNext ||
          (result.current_page || result.page || page) <
            (result.total_pages || result.totalPages || 1),
        hasPrevious:
          result.has_previous ||
          result.hasPrevious ||
          (result.current_page || result.page || page) > 1,
      };
      setProductsPagination(paginationData);

      return result;
    } catch (error: any) {
      const msg = error?.message || t("app.pos.product_search_error");
      toast.error(msg);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  console.log(selectedProduct);

  useEffect(() => {
    getSearchProducts({});
  }, []);
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 sm:gap-4 bg-secondary rounded-md p-3 md:p-4 min-h-14 md:min-h-16 shadow-[0px_0px_20px_4px_rgba(0,_0,_0,_0.1)]">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded-md border border-primary/40 text-muted hover:bg-primary hover:text-white transition-colors cursor-pointer bg-secondary flex-shrink-0 "
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {/* Search Section */}
        <div className="relative w-full">
          <input
            type="text"
            placeholder={t("app.pos.enter_product_name")}
            value={productSearchQuery}
            onChange={(e) => handleProductSearchInputChange(e.target.value)}
            className="w-full px-4 h-8 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
          />
          {productSearchQuery && (
            <button
              onClick={() => {
                setProductSearchQuery("");
                handleProductSearch("", 1);
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="rounded-lg bg-card shadow-lg h-[calc(100vh-9.5rem)] md:h-[calc(100vh-6.5rem)] flex flex-col">
        {/* Products Content */}
        <div className="flex-1 overflow-y-auto  px-0 md:px-4 pb-4 ">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loading />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-lg mb-2">
                {t("app.pos.no_products_found")}
              </div>
              <div className="text-sm">{t("app.pos.try_different_search")}</div>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block ">
                <table className="w-full text-sm relative border-separate border-spacing-y-2">
                  <thead className="sticky top-[0px] z-10 bg-bgColor">
                    <tr>
                      <th className="text-center font-semibold px-2 py-3 border-b w-12 border-r border-gray-300 border rounded-l-lg">
                        №
                      </th>
                      <th className="text-left font-semibold px-4 py-3 border-b border border-gray-300 border-l-0">
                        {t("app.pos.product_article")}
                      </th>
                      <th className="text-left font-semibold px-4 py-3 border-b border border-gray-300 border-l-0">
                        {t("app.pos.product_name")}
                      </th>
                      <th className="text-left font-semibold px-4 py-3 border-b border border-gray-300 border-l-0">
                        {t("app.pos.product_classifier")}
                      </th>

                      <th className="text-left font-semibold px-4 py-3 border-b border-r border-gray-300 border border-l-0 rounded-r-lg">
                        {t("app.pos.price")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product: Product, index: number) => (
                      <tr
                        key={product.id}
                        className="hover:bg-accent/50 cursor-pointer"
                        onClick={() => {
                          setSelectedProduct(product);
                          setActiveModalTab("info");
                          setIsProductModalOpen(true);
                        }}
                      >
                        <td className="border border-border border-r-0 rounded-l-lg">
                          <div className="px-2 py-3 w-12 text-center text-sm text-gray-600">
                            {(productsPagination.currentPage - 1) *
                              productsPagination.pageSize +
                              index +
                              1}
                          </div>
                        </td>
                        <td className="border border-border px-4 py-3">
                          <div className="text-xs text-gray-500">
                            {product.vendor_code}
                          </div>
                        </td>
                        <td className="border border-border px-4 py-3">
                          <div className="font-medium text-sm">
                            {product.title}
                          </div>
                        </td>
                        <td className="border border-border px-4 py-3">
                          <div className="text-sm">
                            {product.classifier_title}
                          </div>
                        </td>

                        <td className="border border-border border-l-0 rounded-r-lg px-4 py-3 min-w-[140px]">
                          <div className="font-semibold text-sm">
                            <div>
                              {product.price?.toLocaleString("ru-RU") || 0}{" "}
                              {t("app.pos.currency")}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden">
                <div className="space-y-3 p-3 md:p-4">
                  {products.map((product: Product, index: number) => (
                    <div
                      key={product.id}
                      className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => {
                        setSelectedProduct(product);
                        setActiveModalTab("info");
                        setIsProductModalOpen(true);
                      }}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="font-medium text-base text-gray-900 mb-1">
                            {product.classifier_title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-1">
                            {product.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            {t("app.pos.article")}: {product.id}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-lg text-gray-900">
                            {product.price?.toLocaleString("ru-RU") || 0}
                          </div>
                          <div className="text-xs text-gray-500">
                            {t("app.pos.currency")}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
        {/* Product Pagination */}
        {!loading &&
          products.length > 0 &&
          productsPagination.totalPages > 1 && (
            <div className="p-2 border-t">
              <Pagination
                currentPage={productsPagination.currentPage}
                totalPages={productsPagination.totalPages}
                onPageChange={(page) => {
                  handleProductSearch(productSearchQuery, page);
                }}
                showMoreItems={
                  productsPagination.currentPage <
                    productsPagination.totalPages ||
                  (productsPagination.totalPages === 1 &&
                    productsPagination.totalItems >
                      productsPagination.pageSize) ||
                  productsPagination.totalItems > products.length
                    ? productsPagination.pageSize
                    : 0
                }
                onShowMore={() => {
                  if (
                    productsPagination.currentPage <
                      productsPagination.totalPages ||
                    (productsPagination.totalPages === 1 &&
                      productsPagination.totalItems >
                        productsPagination.pageSize) ||
                    productsPagination.totalItems > products.length
                  ) {
                    getSearchProducts(
                      { title: productSearchQuery },
                      productsPagination.currentPage + 1,
                      true // append = true for "Show More" functionality
                    );
                  }
                }}
                disabled={loading}
                className=""
              />
            </div>
          )}
      </div>

      {/* Product Details Modal */}
      {isProductModalOpen && selectedProduct && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 md:p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsProductModalOpen(false);
            }
          }}
        >
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md sm:max-w-2xl md:max-w-4xl lg:max-w-6xl h-[95vh] sm:h-[90vh] md:h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-3 md:p-4 border-b bg-gray-50">
              <h2 className="text-base md:text-lg font-semibold text-gray-900 truncate pr-2">
                {selectedProduct.title}
              </h2>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className=" rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground bg-[#ed6b3c68] text-[#ff4400] p-2 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {/* Manage buttons */}
            <div className="border-b bg-gray-50 mb-5">
              <div className="flex sm:flex-none sm:justify-start justify-center gap-2 sm:gap-0">
                <button
                  onClick={() => setActiveModalTab("info")}
                  className={`cursor-pointer w-[45%] sm:w-auto px-3 md:px-6 py-3 sm:py-2 md:py-3 text-sm sm:text-xs md:text-sm font-medium border-b-2 transition-colors ${
                    activeModalTab === "info"
                      ? "border-blue-500 text-blue-600 bg-white"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <span className="hidden sm:inline">
                    {t("product.modal.product_info_tab")}
                  </span>
                  <span className="sm:hidden">
                    {t("product.modal.product_info_tab_short")}
                  </span>
                </button>
                <button
                  onClick={() => setActiveModalTab("stocks")}
                  className={`cursor-pointer w-[45%] sm:w-auto px-3 md:px-6 py-3 sm:py-2 md:py-3 text-sm sm:text-xs md:text-sm font-medium border-b-2 transition-colors ${
                    activeModalTab === "stocks"
                      ? "border-blue-500 text-blue-600 bg-white"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <span className="hidden sm:inline">
                    {t("product.modal.stocks_tab")}
                  </span>
                  <span className="sm:hidden">
                    {t("product.modal.stocks_tab_short")}
                  </span>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-3 pt-0 md:p-6 md:pt-0">
              {activeModalTab === "info" && (
                <>
                  {/* Product info */}
                  <div className="space-y-4 md:space-y-6 flex flex-col md:flex-row justify-center gap-3 md:gap-5">
                    {/* Product Image Placeholder */}
                    <div className="flex justify-center w-full md:w-1/3">
                      <Image
                        src={
                          selectedProduct.image_url
                            ? `${BASE_URL}${selectedProduct.image_url}`
                            : "/images/nophoto.png" // yoki default rasm
                        }
                        width={100}
                        height={100}
                        alt={selectedProduct.name || "image"}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    {/* Product information detail */}
                    <div className="w-full md:w-auto">
                      {/* Price */}
                      <div className="text-xl md:text-3xl font-bold text-blue-600 mb-2 text-center md:text-left">
                        {selectedProduct.price?.toLocaleString("ru-RU") || 0}{" "}
                        {t("app.pos.currency")}
                      </div>

                      {/* Product Details Table */}
                      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <table className="w-full text-xs md:text-sm">
                          <tbody>
                            <tr className="border-b border-gray-200">
                              <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm font-medium text-gray-700 bg-gray-50 w-1/2">
                                {t("app.pos.brand")}
                              </td>
                              <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-900">
                                : {selectedProduct.brand?.name || "-"}
                              </td>
                            </tr>
                            <tr className="border-b border-gray-200">
                              <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm font-medium text-gray-700 bg-gray-50">
                                {t("app.pos.category")}
                              </td>
                              <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-900">
                                : {selectedProduct.category?.name || "-"}
                              </td>
                            </tr>
                            <tr className="border-b border-gray-200">
                              <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm font-medium text-gray-700 bg-gray-50">
                                {t("product.modal.country_manufacturer")}
                              </td>
                              <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-900">
                                : {selectedProduct.made_in?.name || "-"}
                              </td>
                            </tr>
                            <tr className="border-b border-gray-200">
                              <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm font-medium text-gray-700 bg-gray-50">
                                {t("app.pos.article")}
                              </td>
                              <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-900">
                                : {selectedProduct.vendor_code || "-"}
                              </td>
                            </tr>
                            <tr className="border-b border-gray-200">
                              <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm font-medium text-gray-700 bg-gray-50">
                                {t("product.modal.classifier_code")}
                              </td>
                              <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-900">
                                : {selectedProduct.classifier_code || "-"}
                              </td>
                            </tr>
                            <tr className="border-b border-gray-200">
                              <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm font-medium text-gray-700 bg-gray-50">
                                {t("product.modal.classifier")}
                              </td>
                              <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-900">
                                : {selectedProduct.classifier_title || "-"}
                              </td>
                            </tr>
                            <tr className="border-b border-gray-200">
                              <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm font-medium text-gray-700 bg-gray-50">
                                {t("product.modal.unit_measurement")}
                              </td>
                              <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-900">
                                : {selectedProduct.measure || "-"}
                              </td>
                            </tr>
                            <tr className="border-b border-gray-200">
                              <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm font-medium text-gray-700 bg-gray-50">
                                {t("product.modal.package_type")}
                              </td>
                              <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-900">
                                : {selectedProduct.packagename || "-"}
                              </td>
                            </tr>
                            <tr className="border-b border-gray-200">
                              <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm font-medium text-gray-700 bg-gray-50">
                                {t("product.modal.package_code")}
                              </td>
                              <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-900">
                                : {selectedProduct.packagecode || "-"}
                              </td>
                            </tr>
                            <tr>
                              <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm font-medium text-gray-700 bg-gray-50">
                                {t("product.modal.in_package")}
                              </td>
                              <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-900">
                                : -
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {activeModalTab === "stocks" && (
                <>
                  {/* Stocks */}

                  <table className="w-full text-xs md:text-sm relative border-separate border-spacing-y-2">
                    <thead className="sticky -top-[1px] md:top-0 z-50 bg-white">
                      <tr>
                        <th className="text-left font-semibold px-2 md:px-4 py-2 md:py-3 border-b border border-gray-300 rounded-l-lg">
                          {t("product.modal.address")}
                        </th>
                        <th className="text-left font-semibold px-2 md:px-4 py-2 md:py-3 border-b border border-gray-300 border-l-0 hidden sm:table-cell">
                          {t("product.modal.phone_number")}
                        </th>
                        <th className="text-left font-semibold px-2 md:px-4 py-2 md:py-3 border-b border-r border-gray-300 border border-l-0 rounded-r-lg">
                          {t("product.modal.stock")}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedProduct.stocks?.map((item: any) => {
                        return (
                          <tr className="hover:bg-accent/50">
                            <td className="border border-border rounded-l-lg px-2 md:px-4 py-2 md:py-3">
                              <div className="font-medium text-xs md:text-sm">
                                {item.stock.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {item.stock.address ||
                                  t("product.modal.not_specified")}
                              </div>
                              <div className="sm:hidden text-xs text-gray-500 mt-1">
                                {t("product.modal.phone_short")}:{" "}
                                {item.stock.phone ||
                                  t("product.modal.not_specified")}
                              </div>
                            </td>
                            <td className="border border-border px-2 md:px-4 py-2 md:py-3 hidden sm:table-cell">
                              <div className="text-xs md:text-sm text-gray-500">
                                {item.stock.phone ||
                                  t("product.modal.not_specified")}
                              </div>
                            </td>
                            <td className="border border-border border-l-0 rounded-r-lg px-2 md:px-4 py-2 md:py-3">
                              <div className="text-xs md:text-sm">
                                {t("product.modal.remaining_reserved")}:{" "}
                                {item.quantity || 0}/
                                {item.quantity_reserve || 0}
                              </div>
                              <div className="text-xs text-primary">
                                {t("product.modal.own_stock")}: {item.quantity}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
