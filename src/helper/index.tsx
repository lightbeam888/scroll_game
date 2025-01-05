import { toast } from "react-toastify";

export const showToast = (html: string, type: 'info' | 'success' | 'warning' | 'error' | 'default') => {
	toast(html, {
		position: "top-right",
		autoClose: 3000,
		hideProgressBar: false,
		closeOnClick: true,
		pauseOnHover: true,
		draggable: true,
		progress: undefined,
		type,
		theme: 'colored',
	});
}