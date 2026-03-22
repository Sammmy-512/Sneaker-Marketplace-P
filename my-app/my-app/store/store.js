import { atom } from "jotai";

// Currently applied filters
export const filterAtom = atom({
    brands: [],
    minPrice: "",
    maxPrice: "",
    size: "",
    model: ""
})

export const themeAtom = atom('light')