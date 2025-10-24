"use client";

import Loading from "@/components/Loading";
import { Pagination } from "@/components/ui/pagination";
import { getDeviceToken } from "@/lib/token";
import { ChevronLeft, X } from "lucide-react";
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
};

const ProductsPage = () => {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [productSearchQuery, setProductSearchQuery] = React.useState("");
  const [productSearchTimer, setProductSearchTimer] =
    React.useState<NodeJS.Timeout | null>(null);
  const [products, setProducts] = React.useState<Product[]>([]);

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

  useEffect(() => {
    getSearchProducts({});
  }, []);
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-4 bg-secondary rounded-md p-3 md:px-4 md:py-3 min-h-14 md:min-h-16 shadow-[0px_0px_20px_4px_rgba(0,_0,_0,_0.1)]">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-primary/40 text-muted hover:bg-primary hover:text-white transition-colors cursor-pointer bg-secondary"
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
            className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
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

      <div className="rounded-lg bg-card shadow-lg h-[calc(100vh-10rem)] md:h-[calc(100vh-6.5rem)] flex flex-col">
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
                      <th className="text-left font-semibold px-2 py-3 border-b w-12 border-r border-gray-300 border rounded-l-lg">
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
                      <th className="text-left font-semibold px-4 py-3 border-b border border-gray-300 border-l-0">
                        {t("app.pos.remaining_reserve")}
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
                        <td className="border border-border px-4 py-3">
                          <div className="text-sm">
                            {product.remaining || 0}
                          </div>
                          <div className="text-xs text-primary">
                            {t("app.pos.own")}: {product.quantity || 0}
                          </div>
                        </td>
                        <td className="border border-border border-l-0 rounded-r-lg px-4 py-3">
                          <div className="font-semibold text-sm">
                            {product.price?.toLocaleString("ru-RU") || 0}{" "}
                            {t("app.pos.currency")}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden">
                <div className="space-y-3 p-4">
                  {products.map((product: Product, index: number) => (
                    <div
                      key={product.id}
                      className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
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
                      <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                        <div className="text-sm">
                          <span className="text-gray-600">
                            {t("app.pos.remaining_reserve")}:{" "}
                          </span>
                          <span className="font-medium">
                            {product.remaining || 0}
                          </span>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-600">
                            {t("app.pos.own")}:{" "}
                          </span>
                          <span className="font-medium">
                            {product.quantity || 0}
                          </span>
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
    </div>
  );
};

export default ProductsPage;
