import { forwardRef, useLayoutEffect, useState } from "react";

import getCaretCoordinates from "textarea-caret";

import type { ComponentPropsWithRef } from "react";

const CaretFollower = forwardRef<HTMLDivElement, ComponentPropsWithRef<"div"> & { textArea: HTMLTextAreaElement }>(function CaretFollower({ textArea, children, ...rest }, ref) {
	const [position, setPosition] = useState({ x: 0, y: 0 });
	useLayoutEffect(() => {
		function onSelectionChange() {
			if (document.activeElement === textArea) {
				const { top, left, height } = getCaretCoordinates(textArea, textArea.selectionStart);
				setPosition({ x: textArea.offsetLeft + left, y: textArea.offsetTop + top + height - textArea.scrollTop });
			}
		}
		textArea.focus();
		onSelectionChange();
		document.addEventListener("selectionchange", onSelectionChange);
		window.addEventListener("resize", onSelectionChange);
		textArea.addEventListener("selectionchange", onSelectionChange);
		textArea.addEventListener("scroll", onSelectionChange);
		textArea.addEventListener("resize", onSelectionChange);
		return () => {
			document.removeEventListener("selectionchange", onSelectionChange);
			window.removeEventListener("resize", onSelectionChange);
			textArea.removeEventListener("selectionchange", onSelectionChange);
			textArea.removeEventListener("scroll", onSelectionChange);
			textArea.removeEventListener("resize", onSelectionChange);
		};
	}, [textArea]);
	return <div ref={ref} style={{ left: position.x, top: position.y }} {...rest}>{children}</div>;
});

export default CaretFollower;
