/* eslint-disable no-undef */
$(document).ready(() => {
	let count = 0;
	const name = document.getElementById("name");
	$("#login").click(() => {
		if (name.value === "") return;
		if (count > 0) return;
		$.ajax({
			url: "/home",
			type: "post",
			data: { name: name.value },
			dataType: "application/json",
			complete: () => {
				// called when complete
				window.location.replace("/home");
			},
		});
		count += 1;
	});
});
