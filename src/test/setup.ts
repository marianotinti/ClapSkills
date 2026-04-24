import "@testing-library/jest-dom/vitest";

if (typeof URL.createObjectURL !== "function") {
	URL.createObjectURL = () => "blob:clapskills-preview";
}

if (typeof URL.revokeObjectURL !== "function") {
	URL.revokeObjectURL = () => {};
}
