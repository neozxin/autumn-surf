// WebRTC steps:
// 1. Offer side: xWebRTCUtil.Offer.createPeerOffer();
// 2. Offer side: send offerSDP to Answer side by other means
// 3. Answer side: xWebRTCUtil.Answer.createPeerAnswer(offerSDP);
// 4. Answer side: send answerSDP to Offer side by other means
// 5. Offer side: xWebRTCUtil.Offer.setPeerAnswer(answerSDP);
// 6. Offer side: xWebRTCUtil.Offer.offerDC.send('test message 1 from offer side');
// 7. Answer side: xWebRTCUtil.Answer.answerDC.send('test message 1 from answer side');
export const xWebRTCUtil = (() => {
  return {
    Offer: {
      /** @type {RTCPeerConnection | null} */
      offer: null,
      /** @type {RTCDataChannel | null} */
      offerDC: null,
      createPeerOffer(offer = new RTCPeerConnection()) {
        this.offer = offer;
        offer.onicecandidate = (e) =>
          console.log(
            `[Offer] 发现新 Ice Candidate! SDP 描述: ${JSON.stringify(
              offer.localDescription,
            )}`,
          );
        const setDC = () => {
          this.offerDC = offer.createDataChannel("myChannelLabel");
          this.offerDC.onmessage = (e) =>
            console.log(`[Offer] 收到来自 Answer 的信息: ${e.data}`);
          this.offerDC.onopen = (e) => console.log("[Offer] 成功建立连接!");
        };
        setDC();
        offer
          .createOffer()
          .then((o) => offer.setLocalDescription(o))
          .then(() => console.log("[Offer] 设置 Local SDP 成功!"));
        return offer;
      },
      setPeerAnswer(answerSDP) {
        this.offer
          .setRemoteDescription(answerSDP)
          .then(() => console.log("[Offer] 设置 Remote(Answer) SDP 成功!"));
      },
      sendMessage(message) {
        return this.offerDC?.send(message);
      },
    },
    Answer: {
      /** @type {RTCPeerConnection | null} */
      answer: null,
      /** @type {RTCDataChannel | null} */
      answerDC: null,
      createPeerAnswer(offerSDP, answer = new RTCPeerConnection()) {
        this.answer = answer;
        answer.onicecandidate = (e) =>
          console.log(
            `[Answer] 发现新 Ice Candidate! SDP 描述: ${JSON.stringify(
              answer.localDescription,
            )}`,
          );
        const setDC = (event) => {
          this.answerDC = event.channel;
          this.answerDC.onmessage = (e) =>
            console.log(`[Answer] 收到来自 Offer 的信息: ${e.data}`);
          this.answerDC.onopen = (e) => console.log("[Answer] 成功建立连接!");
        };
        answer.ondatachannel = setDC;
        answer
          .setRemoteDescription(offerSDP)
          .then(() => console.log("[Answer] 设置 Remote(Offer) SDP 成功!"));
        answer
          .createAnswer()
          .then((a) => answer.setLocalDescription(a))
          .then(() => console.log("[Answer] 设置 Local SDP 成功!"));
        return answer;
      },
      sendMessage(message) {
        return this.answerDC?.send(message);
      },
    },
  };
})();
