namespace XEngine2 {

	export class BitmapChar {
		public x: number;
		public y: number;
		public width: number;
		public height: number;
		public xoffset: number;
		public yoffset: number;
		public xadvance: number;

		constructor(x: number, y: number, width: number, height: number, xoffset: number, yoffset: number, xadvance: number) {
			this.x = x;
			this.y = y;
			this.width = width;
			this.height = height;
			this.xoffset = xoffset;
			this.yoffset = yoffset;
			this.xadvance = xadvance;
		}

	}

	export class BitmapData {
		public chars: IHash<BitmapChar>;
		public kerning: IHash<IHash<number>>;
		public lineHeight: number;

		constructor(xmlDoc: XMLDocument) {
			this.chars = new IHash<BitmapChar>();
			this.kerning = new IHash<IHash<number>>();
			let charsNode = xmlDoc.children[0].getElementsByTagName("chars")[0];
			let commonNode = xmlDoc.children[0].getElementsByTagName("common")[0];
			let charCount = Number(charsNode.getAttribute("count"));
			let charsArray = charsNode.children;
			this.lineHeight = Number(commonNode.getAttribute("lineHeight"));
			for (let i = 0; i < charCount; i++) {
				let id = Number(charsArray[i].getAttribute("id"));
				let x = Number(charsArray[i].getAttribute("x"));
				let y = Number(charsArray[i].getAttribute("y"));
				let width = Number(charsArray[i].getAttribute("width"));
				let height = Number(charsArray[i].getAttribute("height"));
				let xoffset = Number(charsArray[i].getAttribute("xoffset"));
				let yoffset = Number(charsArray[i].getAttribute("yoffset"));
				let xadvance = Number(charsArray[i].getAttribute("xadvance"));
				this.chars[id] = new BitmapChar(x, y, width, height, xoffset, yoffset, xadvance);
			}

			let kerningNode = xmlDoc.children[0].getElementsByTagName("kernings")[0];
			if (kerningNode !== undefined ) {
				let kerningCount = Number(kerningNode.getAttribute("count"));
				let kerningArray = kerningNode.children;
				for (let i = 0; i < kerningCount; i++) {
					let first = Number(kerningArray[i].getAttribute("first"));
					let second = Number(kerningArray[i].getAttribute("second"));
					let amount = Number(kerningArray[i].getAttribute("amount"));
					if ( this.kerning[first] === undefined ) {
						this.kerning[first] = new IHash<number>();
					}
					this.kerning[first][second] = amount;
				}
			}
		}
	}
}
