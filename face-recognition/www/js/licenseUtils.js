// https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/generateKey
(function() {
	let keyUtils = {
		rsaAlgoSpec : {
		    name: "RSASSA-PKCS1-v1_5",
		    modulusLength: 4096,
		    publicExponent: new Uint8Array([1, 0, 1]),
		    hash: { name: "SHA-512" },
		},
		keyPair: async function() {
			return await window.crypto.subtle.generateKey(
		  				window.CryptoKeyUtils.rsaAlgoSpec,
		  				true,
		  				["sign", "verify"]
		  				);
		},
		exportCryptoKey: async function(format, k) {
		  const exported = await window.crypto.subtle.exportKey(format, k);
		  const exportedKeyBuffer = new Uint8Array(exported);
		  return exportedKeyBuffer;
		},
		exportPrivateKey: async function(key) { 
			return await window.CryptoKeyUtils.exportCryptoKey("pkcs8", key);
		},
		exportPublicKey: async function(key) {
			return await window.CryptoKeyUtils.exportCryptoKey("spki", key);
		},
		exportPrivateKey2Str: async function(key) {
			let keyBuf = await window.CryptoKeyUtils.exportPrivateKey(key);
			return window.CryptoKeyUtils.key2Str(keyBuf);
		},
		exportPublicKey2Str: async function(key) {
			let keyBuf = await window.CryptoKeyUtils.exportPublicKey(key);
			return window.CryptoKeyUtils.key2Str(keyBuf);
		},
		importKey: async function(format, key, purpose) {
			return await window.crypto.subtle.importKey(format, key, window.CryptoKeyUtils.rsaAlgoSpec, true, purpose);
		},
		importPrivateKey: async function(key) {
			return await window.CryptoKeyUtils.importKey('pkcs8', key, ['sign']);
		},
		importPublicKey: async function(key) {
			return await window.CryptoKeyUtils.importKey('spki', key, ['verify']);
		},
		importPrivateKeyFromStr: async function(keyStr) {
			let keyBuf = window.CryptoKeyUtils.str2key(keyStr);
			return await window.CryptoKeyUtils.importPrivateKey(keyBuf);
		},
		importPublicKeyFromStr: async function(keyStr) {
			let keyBuf = window.CryptoKeyUtils.str2key(keyStr);
			return await window.CryptoKeyUtils.importPublicKey(keyBuf);
		},
		getMessageEncoding: function(message) {
		  let enc = new TextEncoder();
		  return enc.encode(message);
		},
		decodeBuffer: function(buf) {
		  let dec = new TextDecoder('utf-8');
		  return dec.decode(buf);
		},
		key2Str: function(exportedKeyBuffer) {
			return exportedKeyBuffer.join(',')
		},
		str2key: function(keyStr) {
			return new Uint8Array(keyStr.split(',').map(a => parseInt(a)));
		},
		sign: async function(message, privateKey) {
			let encoded = window.CryptoKeyUtils.getMessageEncoding(message);
			let signature = await window.crypto.subtle.sign("RSASSA-PKCS1-v1_5", privateKey, encoded);
			return new Uint8Array(signature);
		},
		signStr: async function(message, privateKey) {
			let signature = await window.CryptoKeyUtils.sign(message, privateKey);
			return window.CryptoKeyUtils.key2Str(signature);
		},
		verify: async function(message, signature, publicKey) {
		  let encoded = window.CryptoKeyUtils.getMessageEncoding(message);
		  let result = await window.crypto.subtle.verify(
		    "RSASSA-PKCS1-v1_5",
		    publicKey,
		    signature,
		    encoded,
		  );
		  return result;
		},
		verifyStr: async function(message, signatureStr, publicKey) {
			let signatureBuf = window.CryptoKeyUtils.str2key(signatureStr).buffer;
			return await window.CryptoKeyUtils.verify(message, signatureBuf, publicKey);
		},
		example: async function(message) {
			let keyPair = await window.CryptoKeyUtils.keyPair();
			let exportedPrivateKey = await window.CryptoKeyUtils.exportPrivateKey2Str(keyPair.privateKey);
			let exportedPublicKey = await window.CryptoKeyUtils.exportPublicKey2Str(keyPair.publicKey);
			console.log('publicKey:', exportedPublicKey);
			console.log('privateKey:', exportedPublicKey);
			let importedPublicKey = await window.CryptoKeyUtils.importPublicKeyFromStr(exportedPublicKey);
			let importedPrivateKey = await window.CryptoKeyUtils.importPrivateKeyFromStr(exportedPrivateKey);

			let signatureStr = await window.CryptoKeyUtils.signStr(message, importedPrivateKey);
			console.log('message signature:', signatureStr);
			
			let verifyResult = await window.CryptoKeyUtils.verifyStr(message, signatureStr, importedPublicKey);
			console.log('verify result:', verifyResult);

			let tamperedMessageResult = await window.CryptoKeyUtils.verifyStr(message + '1', signatureStr, importedPublicKey);
			console.log('Tampered message verify result: ', tamperedMessageResult);
		}
	};

	window.CryptoKeyUtils = keyUtils;
}());
