const SIZE_REFERENCE = 60;

export default class Converter{

	constructor(screenSizeInPx){
		this.screenSize = this.toAbsolutePixel(screenSizeInPx);
		this.scale = getScaleByScreenSize(screenSizeInPx);
	}

	toAbsolutePixel(value){
		return value * this.scale;
	}

	convertToPos(event){
		return {
			position: {
				x: this.toAbsolutePixel(event.clientX),
				y: this.toAbsolutePixel(event.clientY)
			}
		}
	}

	getScaleByScreenSize(screenSize){
		// calculate diagonal using pythagorean theorem
		const widthHeight = Math.pow(screen.height, 2) + Math.pow(screen.width, 2);
		const diagonal = Math.sqrt(widthHeight);

		const diagonalCM = screenSize * 2.54;
		const pixelsPerCentimeter = diagonal / diagonalCM;

		return SIZE_REFERENCE/pixelsPerCentimeter;
	}

}