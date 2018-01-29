namespace XEngine {

	export interface IHash {
		[id: number]: BitmapChar;
	}

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

	export class BitmapKerning {
		public amount: number;

		constructor(amount: number) {
			this.amount = amount;
		}
	}
	export class BitmapData {
		public chars: IHash;
		public kerning: Array<BitmapKerning>;

		public BitmapData(xmlDoc: XMLDocument) {
			let charsNode = xmlDoc.children[0].getElementsByTagName("chars")[0];
			let charCount = Number(charsNode.getAttribute("count"));
			let charsArray = charsNode.children;
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
			let kerningCount = Number(kerningNode.getAttribute("count"));
			let kerningArray = kerningNode.children;
			for (let i = 0; i < kerningCount; i++) {
				let first = Number(kerningArray[i].getAttribute("first"));
				let second = Number(kerningArray[i].getAttribute("second"));
				let amount = Number(kerningArray[i].getAttribute("amount"));
			}
		}
	}
}
