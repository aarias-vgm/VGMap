export function addSVGStrokes() {
    setTimeout(() => {
        document.querySelectorAll("svg[data-class='shape-marker']").forEach(svg => {
            if (svg instanceof SVGElement) {
                svg.querySelectorAll("path").forEach(path => {
                    path.setAttribute("fill", svg.dataset.iconColor || "");
                    path.setAttribute("fill-rule", "evenodd");

                    path.setAttribute("style", "pointer-events: auto; cursor: pointer;");

                    path.setAttribute("stroke", svg.dataset.borderColor || "");
                    path.setAttribute("stroke-width", "20");
                    path.setAttribute("stroke-linejoin", "round");
                    path.setAttribute("stroke-linecap", "round");
                });

                svg.setAttribute("overflow", "visible");
                svg.style.margin = "1px";
            }
        });
    }, 50);
}