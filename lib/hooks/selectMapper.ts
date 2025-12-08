
export const mapToSelectOptions = <T,>(
  items: T[],
  getValue: (item: T) => string | number,
  getLabel: (item: T) => string,
  getColor?: (item: T) => string | undefined
) =>
  items.map((item) => ({
    value: String(getValue(item)),
    label: getLabel(item),
    color: getColor ? getColor(item): undefined
  }));