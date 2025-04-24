import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Layout from "@/components/Layout";
import SearchBar from "@/components/SearchBar";
import { usePatients } from "@/utils/patientStore";
import { Patient } from "@/utils/patientStore";
import { Filter, Search as SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PatientList from "@/components/PatientList";
import EmptyState from "@/components/EmptyState";
import { toast } from "@/components/ui/use-toast";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";

const Search = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialQuery = queryParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [baseResults, setBaseResults] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    sex: "all",
    ageMin: "",
    ageMax: "",
    sortBy: "recent",
  });
  const [currentPage, setCurrentPage] = useState(1); // Track the current page
  const resultsPerPage = 8;

  const { patients, searchPatients } = usePatients();

  useEffect(() => {
    const initializeSearch = async () => {
      if (initialQuery) {
        try {
          const results = await searchPatients(initialQuery);
          setBaseResults(results);
        } catch (error) {
          toast({
            title: "Search Error",
            description: "Failed to search patients. Please try again.",
            variant: "destructive",
          });
          setBaseResults([]);
        }
      } else {
        setBaseResults(patients);
      }
    };

    initializeSearch();
  }, [initialQuery, patients, searchPatients]);

  const handleSearch = async (searchQuery: string) => {
    setQuery(searchQuery);

    if (!searchQuery.trim()) {
      setBaseResults(patients);
      return;
    }

    try {
      const results = await searchPatients(searchQuery);
      setBaseResults(results);
    } catch (error) {
      console.error("Search error:", error);
      toast({
        title: "Search Error",
        description: "Failed to search patients. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>,
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    let results = [...baseResults];

    if (filters.sex !== "all") {
      results = results.filter((patient) => patient.sex === filters.sex);
    }

    if (filters.ageMin) {
      results = results.filter(
        (patient) => patient.age >= Number(filters.ageMin),
      );
    }

    if (filters.ageMax) {
      results = results.filter(
        (patient) => patient.age <= Number(filters.ageMax),
      );
    }

    results.sort((a, b) => {
      if (filters.sortBy === "name") {
        return a.name.localeCompare(b.name);
      } else if (filters.sortBy === "age") {
        return a.age - b.age;
      } else if (filters.sortBy === "recent") {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }
      return 0;
    });

    setFilteredPatients(results);
  };

  useEffect(() => {
    applyFilters();
  }, [filters, baseResults]);

  return (
    <Layout className="dark:bg-zinc-800 dark:text-white min-h-screen bg-green-100">
      <div className="container max-w-6xl py-6 space-y-6 mx-auto ">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Patient Search
          </h1>
          <p className="text-muted-foreground dark:text-zinc-300">
            Search through {patients.length.toLocaleString()} patient records
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <SearchBar
            onSearch={handleSearch}
            placeholder="Search by name, diagnosis, or notes..."
          />

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="dark:text-white dark:border-zinc-400 border-green-500 bg-green-400 hover:brightness-125 dark:bg-green-600"
            >
              <Filter size={14} className="mr-2" />
              Filters
            </Button>

            <Badge variant="secondary" className="ml-auto ">
              {filteredPatients.length} results
            </Badge>
          </div>

          {showFilters && (
            <Card className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Sex</label>
                  <select
                    name="sex"
                    value={filters.sex}
                    onChange={handleFilterChange}
                    className="w-full p-2 rounded-lg border dark:border-zinc-500 bg-transparent focus:ring-2 focus:ring-primary/40 outline-none transition-all duration-200"
                  >
                    <option value="all">All</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 ">
                    Min Age
                  </label>
                  <input
                    type="number"
                    name="ageMin"
                    value={filters.ageMin}
                    onChange={handleFilterChange}
                    placeholder="Min"
                    min="0"
                    className="w-full p-2 rounded-lg dark:border-zinc-500 border bg-transparent focus:ring-2 focus:ring-primary/40 outline-none transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Max Age
                  </label>
                  <input
                    type="number"
                    name="ageMax"
                    value={filters.ageMax}
                    onChange={handleFilterChange}
                    placeholder="Max"
                    min="0"
                    className="w-full p-2 rounded-lg dark:border-zinc-500 border bg-transparent focus:ring-2 focus:ring-primary/40 outline-none transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Sort By
                  </label>
                  <select
                    name="sortBy"
                    value={filters.sortBy}
                    onChange={handleFilterChange}
                    className="w-full p-2 rounded-lg dark:border-zinc-500 border bg-transparent focus:ring-2 focus:ring-primary/40 outline-none transition-all duration-200"
                  >
                    <option value="name">Name (A-Z)</option>
                    <option value="age">Age</option>
                    <option value="recent">Most Recent</option>
                  </select>
                </div>
              </div>
            </Card>
          )}
        </div>

        {filteredPatients.length > 0 ? (
          <PatientList
            patients={filteredPatients.slice(
              (currentPage - 1) * resultsPerPage,
              currentPage * resultsPerPage,
            )}
            containerClassName="h-[calc(100vh-300px)]"
          />
        ) : (
          <EmptyState
            icon={SearchIcon}
            title="No results found"
            description={
              query
                ? `No patients match "${query}"`
                : "Try adjusting your search or filters"
            }
          />
        )}
      </div>
      <div className="flex justify-center mt-4">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              />
            </PaginationItem>

            {Array.from(
              { length: Math.ceil(filteredPatients.length / resultsPerPage) },
              (_, index) => (
                <PaginationItem key={index}>
                  <PaginationLink
                    isActive={currentPage === index + 1}
                    onClick={() => setCurrentPage(index + 1)}
                  >
                    {index + 1}
                  </PaginationLink>
                </PaginationItem>
              ),
            )}

            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(
                      prev + 1,
                      Math.ceil(filteredPatients.length / resultsPerPage),
                    ),
                  )
                }
                disabled={
                  currentPage ===
                  Math.ceil(filteredPatients.length / resultsPerPage)
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </Layout>
  );
};

export default Search;
