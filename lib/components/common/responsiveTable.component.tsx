"use client";

import React, {
  useState,
  useMemo,
  forwardRef,
  useImperativeHandle,
  ReactNode,
} from "react";
import {
  Table,
  Card,
  Text,
  TextInput,
  Pagination,
  Select,
  ActionIcon,
  Group,
  Stack,
  Grid,
  Container,
  Paper,
  Box,
  Flex,
  Checkbox,
  Loader,
  SimpleGrid,
  ButtonVariant,
  Button,
} from "@mantine/core";
import {
  IconSearch,
  IconSortAscending,
  IconSortDescending,
  IconSelector,
  IconArrowUp,
  IconArrowDown,
  IconArrowsSort,
  IconDownload,
} from "@tabler/icons-react";


// Tipos para la configuración de columnas
export interface Column<T> {
  field: keyof T | string;
  headerName: string;
  sortable?: boolean;
  width?: number;
  renderCell?: (value: any, row: any, index: number) => React.ReactNode;
  align?: "left" | "center" | "right";
}

export interface DataTableProps {
  columns: Column<any>[];
  rows: any[];
  enablePagination?: boolean;
  enableSearch?: boolean;
  enableSorting?: boolean;
  enableSelection?: boolean;
  pageSizes?: number[];
  searchPlaceholder?: string;
  noDataMessage?: string;
  spanColumsForTablet?: number;
  spanColumsForMobile?: number;
  rowIdField?: string;
  mobileMode?: boolean;
  exportHandler?: () => void;
  // Modo manual (controlado externamente)
  manualMode?: boolean;
  totalRows?: number;
  onSearchChange?: (
    search: string,
    pageSize: number,
    direction: boolean,
    field: string | null
  ) => void;
  onSortChange?: (
    sortBy: string | null,
    sortDirection: boolean,
    searchTerm: string,
    pageSize: number
  ) => void;
  onPageChange?: (
    page: number,
    pageSize: number,
    searchTerm: string,
    direction: boolean,
    field: string | null
  ) => void;
  loading?: boolean;
}

// Interface para el ref del componente
export interface DataTableRef {
  getSelectedRows: () => any[];
  clearSelection: () => void;
  selectAll: () => void;
  selectRows: (rowIds: any[]) => void;
}

// Función para ordenar datos
const sortData = (data: any[], sortBy: string | null, reversed: boolean) => {
  if (!sortBy) return data;

  return [...data].sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];

    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;

    let comparison = 0;
    if (typeof aValue === "string" && typeof bValue === "string") {
      comparison = aValue.localeCompare(bValue);
    } else if (typeof aValue === "number" && typeof bValue === "number") {
      comparison = aValue - bValue;
    } else {
      comparison = String(aValue).localeCompare(String(bValue));
    }

    return reversed ? -comparison : comparison;
  });
};

// Función para filtrar datos
const filterData = (data: any[], search: string, columns: Column<any>[]) => {
  if (!search) return data;

  return data.filter((item) =>
    columns.some((column) => {
      const value = item[column.field];
      return String(value || "")
        .toLowerCase()
        .includes(search.toLowerCase());
    })
  );
};

const ResponsiveDataTable = forwardRef<DataTableRef, DataTableProps>(
  (
    {
      columns,
      rows,
      enablePagination = true,
      enableSearch = true,
      enableSorting = true,
      enableSelection = false,
      pageSizes = [10, 50, 100],
      searchPlaceholder = "Buscar...",
      noDataMessage = "No hay datos disponibles",
      spanColumsForMobile = 1,
      spanColumsForTablet = 2,
      rowIdField = "id",
      manualMode = false,
      mobileMode = false,
      totalRows,
      onSearchChange,
      onSortChange,
      onPageChange,
      loading = false,
      exportHandler,
    },
    ref
  ) => {
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState<string | null>(null);
    const [reverseSortDirection, setReverseSortDirection] = useState(false);
    const [activePage, setActivePage] = useState(1);
    const [pageSize, setPageSize] = useState(pageSizes[0]);
    const [selectedRows, setSelectedRows] = useState<Set<any>>(new Set());

    // Exponer métodos públicos através del ref
    useImperativeHandle(ref, () => ({
      getSelectedRows: () => {
        return rows.filter((row) => selectedRows.has(row[rowIdField]));
      },
      clearSelection: () => {
        setSelectedRows(new Set());
      },
      selectAll: () => {
        const allIds = new Set(rows.map((row) => row[rowIdField]));
        setSelectedRows(allIds);
      },
      selectRows: (rowIds: any[]) => {
        setSelectedRows(new Set(rowIds));
      },
    }));

    // Procesar datos
    const processedData = useMemo(() => {
      // En modo manual, usar directamente las filas proporcionadas
      if (manualMode) {
        return rows;
      }

      // En modo automático, procesar en el frontend
      let filtered = filterData(rows, search, columns);
      let sorted = sortData(filtered, sortBy, reverseSortDirection);

      if (enablePagination) {
        const start = (activePage - 1) * pageSize;
        const end = start + pageSize;
        sorted = sorted.slice(start, end);
      }

      return sorted;
    }, [
      rows,
      search,
      sortBy,
      reverseSortDirection,
      activePage,
      pageSize,
      columns,
      enablePagination,
      manualMode,
    ]);

    const totalPages = enablePagination
      ? manualMode
        ? Math.ceil((totalRows || rows.length) / pageSize)
        : Math.ceil(filterData(rows, search, columns).length / pageSize)
      : 1;

    // Lógica para el checkbox principal
    const filteredRows = useMemo(() => {
      if (manualMode) {
        return rows;
      }
      return filterData(rows, search, columns);
    }, [rows, search, columns, manualMode]);

    const isAllSelected =
      filteredRows.length > 0 &&
      filteredRows.every((row) => selectedRows.has(row[rowIdField]));
    const isIndeterminate =
      filteredRows.some((row) => selectedRows.has(row[rowIdField])) &&
      !isAllSelected;

    // Manejar selección de todos
    const handleSelectAll = () => {
      if (isAllSelected) {
        // Deseleccionar todos los filtrados
        const newSelected = new Set(selectedRows);
        filteredRows.forEach((row) => newSelected.delete(row[rowIdField]));
        setSelectedRows(newSelected);
      } else {
        // Seleccionar todos los filtrados
        const newSelected = new Set(selectedRows);
        filteredRows.forEach((row) => newSelected.add(row[rowIdField]));
        setSelectedRows(newSelected);
      }
    };

    // Manejar selección individual
    const handleRowSelect = (rowId: any) => {
      const newSelected = new Set(selectedRows);
      if (newSelected.has(rowId)) {
        newSelected.delete(rowId);
      } else {
        newSelected.add(rowId);
      }
      setSelectedRows(newSelected);
    };

    // Manejar ordenamiento
    const handleSort = (field: string) => {
      const column = columns.find((col) => col.field === field);
      if (!column?.sortable || !enableSorting) return;

      const reversed = field === sortBy ? !reverseSortDirection : false;
      setReverseSortDirection(reversed);
      setSortBy(field);
      setActivePage(1);

      // Si está en modo manual, llamar al callback
      if (manualMode && onSortChange) {
        onSortChange(field, reversed, search, pageSize);
      }
    };

    // Manejar cambio de búsqueda
    const handleSearchChange = (value: string) => {
      setSearch(value);

      // En modo automático, buscar inmediatamente
      if (!manualMode) {
        setActivePage(1);
      }
    };

    // Manejar búsqueda con Enter (solo en modo manual)
    const handleSearchSubmit = () => {
      if (manualMode && onSearchChange) {
        setActivePage(1);
        onSearchChange(search, pageSize, reverseSortDirection, sortBy);
      }
    };

    // Manejar cambio de página
    const handlePageChangeInternal = (page: number) => {
      setActivePage(page);

      // Si está en modo manual, llamar al callback
      if (manualMode && onPageChange) {
        onPageChange(page, pageSize, search, reverseSortDirection, sortBy);
      }
    };

    // Manejar cambio de tamaño de página
    const handlePageSizeChange = (newPageSize: string | null) => {
      if (newPageSize) {
        const newSize = parseInt(newPageSize);
        setPageSize(newSize);
        setActivePage(1);

        // Si está en modo manual, llamar al callback
        if (manualMode && onPageChange) {
          onPageChange(1, newSize, search, reverseSortDirection, sortBy);
        }
      }
    };

    // Obtener opciones de ordenamiento para móvil/tablet
    const sortOptions = columns
      .filter((col) => col.sortable)
      .map((col) => ({ value: col.field.toString(), label: col.headerName }));

    // Opciones para el selector de tamaño de página
    const pageSizeOptions = pageSizes.map((size) => ({
      value: size.toString(),
      label: size.toString(),
    }));

    // Componente de ordenamiento para móvil/tablet
    const MobileSortControls = () => (
      <Flex direction={"row"} align={"center"} gap={5}>
        <Select
          placeholder="Ordenar por..."
          data={sortOptions}
          value={sortBy}
          onChange={(value) => {
            setSortBy(value);
            setActivePage(1);
            if (manualMode && onSortChange && value) {
              onSortChange(value, reverseSortDirection, search, pageSize);
            }
          }}
          clearable
          style={{ width: "100%" }}
        />
        {sortBy && (
          <ActionIcon
            variant="subtle"
            onClick={() => {
              const newReversed = !reverseSortDirection;
              setReverseSortDirection(newReversed);
              setActivePage(1);
              if (manualMode && onSortChange && sortBy) {
                onSortChange(sortBy, newReversed, search, pageSize);
              }
            }}
          >
            {reverseSortDirection ? (
              <IconSortDescending size={20} />
            ) : (
              <IconSortAscending size={20} />
            )}
          </ActionIcon>
        )}
      </Flex>
    );

    // Componente Card unificado para móvil y tablet
    const ResponsiveCard = ({ item, index }: { item: any; index: number }) => (
      <Card
        key={index}
        padding="xs"
        withBorder
        style={{ position: "relative" }}
      >
        {enableSelection && (
          <Paper
            withBorder
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              padding: 10,
              borderTop: 0,
              borderRight: 0,
              borderRadius: "0px 10px 0px 10px",
            }}
          >
            <Checkbox
              checked={selectedRows.has(item[rowIdField])}
              onChange={() => handleRowSelect(item[rowIdField])}
              size="sm"
            />
          </Paper>
        )}
        <SimpleGrid
          spacing="xs"
          mt={enableSelection ? 8 : 0}
          cols={{
            base: mobileMode ? spanColumsForMobile : spanColumsForMobile,
            xs: mobileMode ? spanColumsForMobile : spanColumsForTablet,
            sm: mobileMode ? spanColumsForMobile : spanColumsForTablet,
            md: mobileMode ? spanColumsForMobile : spanColumsForTablet + 2,
          }}
        >
          {columns.map((column, colIndex) => (
            <Stack gap="1px" key={colIndex}>
              <Text c="dimmed" fw={500} fz={"sm"}>
                {column.headerName}
              </Text>
              {/* CAMBIO AQUÍ: Removí el Box wrapper y agregué style directamente */}
              <div
                style={{
                  fontSize: "0.85rem",
                }}
              >
                {column.renderCell ? (
                  column.renderCell(item[column.field], item, index)
                ) : (
                  <Text fz={"0.85rem"}>{item[column.field] || "-"}</Text>
                )}
              </div>
            </Stack>
          ))}
        </SimpleGrid>
      </Card>
    );

    return (
      // <Container fluid p={0} w={"100%"}>

      // </Container>
      <Stack gap="sm" p={0} w={"100%"}>
        {/* Controles superiores */}
        <Flex gap="10px" direction={"column"}>
          <Flex gap={7} align="center">
            {enableSelection && (
              <Checkbox
                checked={isAllSelected}
                indeterminate={isIndeterminate}
                onChange={handleSelectAll}
                label={enableSearch ? "" : "Seleccionar Items"}
                size="sm"
              />
            )}
            {enableSearch && (
              <Flex direction={"row"} gap={7} align={"center"} w={"100%"}>
                <TextInput
                  w={"100%"}
                  placeholder={searchPlaceholder}
                  leftSection={<IconSearch size={16} />}
                  value={search}
                  onChange={(event) => {
                    handleSearchChange(event.currentTarget.value);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      handleSearchSubmit();
                    }
                  }}
                  style={{ width: "100%" }}
                  disabled={loading}
                />
                {manualMode && (
                  <ActionIcon
                    variant="light"
                    size={"lg"}
                    onClick={() => handleSearchSubmit()}
                  >
                    <IconSearch size={"1rem"}></IconSearch>
                  </ActionIcon>
                )}
              </Flex>
            )}
            {exportHandler && (
              <ActionIcon
                variant={"light"}
                size={"lg"}
                onClick={exportHandler}
              >
                <IconDownload size={'1rem'}/>
              </ActionIcon>
            )}
          </Flex>

          {/* Controles de ordenamiento para móvil/tablet */}
          <Box hiddenFrom="md">
            {enableSorting && sortOptions.length > 0 && <MobileSortControls />}
          </Box>
        </Flex>

        {/* Vista de escritorio - Tabla */}
        {!mobileMode && (
          <Paper
            visibleFrom="lg"
            withBorder
            style={{
              width: "100%",
              overflowX: "auto",
              opacity: loading ? 0.6 : 1,
              pointerEvents: loading ? "none" : "auto",
            }}
          >
            <Table withColumnBorders striped>
              <Table.Thead bg={"#67ab25"}>
                <Table.Tr>
                  {enableSelection && (
                    <Table.Th style={{ width: 40 }}>
                      {/* <Checkbox
                        checked={isAllSelected}
                        indeterminate={isIndeterminate}
                        onChange={handleSelectAll}
                        size="sm"
                        style={{cursor: 'pointer'}}
                      /> */}
                    </Table.Th>
                  )}
                  {columns.map((column) => (
                    <Table.Th
                      key={column.field.toString()}
                      style={{
                        cursor:
                          column.sortable && enableSorting
                            ? "pointer"
                            : "default",
                      }}
                      onClick={() => handleSort(column.field.toString())}
                      miw={0}
                    >
                      <Flex
                        gap="2px"
                        wrap="nowrap"
                        align={"center"}
                        justify={"space-between"}
                        style={{ position: "relative" }}
                      >
                        <Text
                          fw={500}
                          size="14px"
                          c="white"
                          title={column.headerName}
                        >
                          {column.headerName}
                        </Text>
                        <Box h={"15px"}>
                          {column.sortable &&
                            enableSorting &&
                            (sortBy === column.field ? (
                              reverseSortDirection ? (
                                <IconArrowDown color="white" size={"1rem"} />
                              ) : (
                                <IconArrowUp color="white" size={"1rem"} />
                              )
                            ) : (
                              <IconArrowsSort
                                color="white"
                                size={"1rem"}
                                opacity={0.5}
                              />
                            ))}
                        </Box>
                      </Flex>
                    </Table.Th>
                  ))}
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {processedData && processedData.length > 0 ? (
                  processedData.map((row, index) => (
                    <Table.Tr key={index} miw={0}>
                      {enableSelection && (
                        <Table.Td>
                          <Checkbox
                            checked={selectedRows.has(row[rowIdField])}
                            onChange={() => handleRowSelect(row[rowIdField])}
                            size="sm"
                          />
                        </Table.Td>
                      )}
                      {columns.map((column) => (
                        <Table.Td
                          key={column.field.toString()}
                          style={{
                            textAlign: column.align || "left",
                            fontSize: "0.9rem",
                          }}
                        >
                          {column.renderCell ? (
                            column.renderCell(row[column.field], row, index)
                          ) : (
                            <Text fz={"0.84rem"}>
                              {row[column.field] || "-"}
                            </Text>
                          )}
                        </Table.Td>
                      ))}
                    </Table.Tr>
                  ))
                ) : (
                  <Table.Tr>
                    <Table.Td
                      colSpan={columns.length + (enableSelection ? 1 : 0)}
                    >
                      <Text ta="center" c="dimmed" py="0.5rem">
                        {noDataMessage}
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                )}
              </Table.Tbody>
            </Table>
          </Paper>
        )}

        {/* Vista móvil y tablet - Cards unificadas */}
        {!mobileMode && (
          <Box
            hiddenFrom="lg"
            style={{
              opacity: loading ? 0.6 : 1,
              pointerEvents: loading ? "none" : "auto",
            }}
          >
            <Stack gap="xs">
              {processedData && processedData.length > 0 ? (
                processedData.map((item, index) => (
                  <ResponsiveCard key={index} item={item} index={index} />
                ))
              ) : (
                <Text ta="center" c="dimmed" py="0px">
                  {noDataMessage}
                </Text>
              )}
            </Stack>
          </Box>
        )}

        {mobileMode && (
          <Box
            style={{
              opacity: loading ? 0.6 : 1,
              pointerEvents: loading ? "none" : "auto",
            }}
          >
            <Stack gap="xs">
              {processedData && processedData.length > 0 ? (
                processedData.map((item, index) => (
                  <ResponsiveCard key={index} item={item} index={index} />
                ))
              ) : (
                <Text ta="center" c="dimmed" py="0px">
                  {noDataMessage}
                </Text>
              )}
            </Stack>
          </Box>
        )}

        {/* Paginación con selector de tamaño de página */}
        {enablePagination && (
          <Flex
            justify="flex-end"
            align={"center"}
            gap={10}
            direction={{ base: "column", xs: "row", md: "row" }}
          >
            <Flex gap={2} align={"center"}>
              <Text>Cant.</Text>
              <Select
                data={pageSizeOptions}
                value={pageSize.toString()}
                onChange={handlePageSizeChange}
                variant="transparent"
                style={{ width: "90px" }}
                checkIconPosition="right"
                size="md"
              />
              <Text>{`${(activePage - 1) * pageSize + 1}-${
                (activePage - 1) * pageSize + processedData.length
              } de ${
                manualMode ? totalRows || rows.length : rows.length
              }`}</Text>
            </Flex>
            {totalPages > 1 && (
              <Pagination
                total={totalPages}
                value={activePage}
                onChange={handlePageChangeInternal}
                withPages={false}
                gap={5}
                disabled={loading}
              />
            )}
          </Flex>
        )}
      </Stack>
    );
  }
);

ResponsiveDataTable.displayName = "ResponsiveDataTable";

export default ResponsiveDataTable;
