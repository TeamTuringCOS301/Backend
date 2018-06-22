module.exports = (point, polygon) => {
	let inside = false;
	let prev = polygon[polygon.length - 1];
	for(let curr of polygon) {
		if((curr.lat < point.lat) != (prev.lat < point.lat) && point.lng < prev.lng
				+ (curr.lng - prev.lng) * (point.lat - prev.lat) / (curr.lat - prev.lat)) {
			inside = !inside;
		}
		prev = curr;
	}
	return inside;
};
