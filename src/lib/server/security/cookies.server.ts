import { getCookie, setCookie, deleteCookie, getRequest } from "@tanstack/react-start/server";

export function getServerCookie(name: string): string | undefined {
  return getCookie(name);
}

export function setServerCookie(
  name: string,
  value: string,
  options?: Parameters<typeof setCookie>[2],
): void {
  setCookie(name, value, options);
}

export function deleteServerCookie(
  name: string,
  options?: Parameters<typeof deleteCookie>[1],
): void {
  deleteCookie(name, options);
}

export function getServerRequest(): Request {
  return getRequest();
}
