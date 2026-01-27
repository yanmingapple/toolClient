<template>
  <div v-show="loading" class="cus-loading">
    <div class="scene">
      <svg
        version="1.1"
        id="dc-spinner"
        xmlns="http://www.w3.org/2000/svg"
        x="0px"
        y="0px"
        width="38"
        height="38"
        viewBox="0 0 38 38"
        preserveAspectRatio="xMinYMin meet"
      >
        <text
          x="10"
          y="21"
          font-family="Monaco"
          font-size="3px"
          style="letter-spacing: 0.6"
          fill="white"
        >
        已耗时{{ timeNum }}秒
          <animate
            attributeName="opacity"
            values="0;1;0"
            dur="1s"
            repeatCount="indefinite"
          />
        </text>
        <path
          fill="#373a42"
          d="M20,35c-8.271,0-15-6.729-15-15S11.729,5,20,5s15,6.729,15,15S28.271,35,20,35z M20,5.203
    C11.841,5.203,5.203,11.841,5.203,20c0,8.159,6.638,14.797,14.797,14.797S34.797,28.159,34.797,20
    C34.797,11.841,28.159,5.203,20,5.203z"
        ></path>

        <path
          fill="#373a42"
          d="M20,33.125c-7.237,0-13.125-5.888-13.125-13.125S12.763,6.875,20,6.875S33.125,12.763,33.125,20
    S27.237,33.125,20,33.125z M20,7.078C12.875,7.078,7.078,12.875,7.078,20c0,7.125,5.797,12.922,12.922,12.922
    S32.922,27.125,32.922,20C32.922,12.875,27.125,7.078,20,7.078z"
        ></path>

        <path
          fill="#2AA198"
          stroke="#2AA198"
          stroke-width="0.6027"
          stroke-miterlimit="10"
          d="M5.203,20
			c0-8.159,6.638-14.797,14.797-14.797V5C11.729,5,5,11.729,5,20s6.729,15,15,15v-0.203C11.841,34.797,5.203,28.159,5.203,20z"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 20 20"
            to="360 20 20"
            calcMode="spline"
            keySplines="0.4, 0, 0.2, 1"
            keyTimes="0;1"
            dur="2s"
            repeatCount="indefinite"
          />
        </path>

        <path
          fill="#859900"
          stroke="#859900"
          stroke-width="0.2027"
          stroke-miterlimit="10"
          d="M7.078,20
  c0-7.125,5.797-12.922,12.922-12.922V6.875C12.763,6.875,6.875,12.763,6.875,20S12.763,33.125,20,33.125v-0.203
  C12.875,32.922,7.078,27.125,7.078,20z"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 20 20"
            to="360 20 20"
            dur="1.8s"
            repeatCount="indefinite"
          />
        </path>
      </svg>
    </div>
    <!-- <h1 class="loadingtext">
      <span>L</span>
      <span>o</span>
      <span>a</span>
      <span>d</span>
      <span>i</span>
      <span>n</span>
      <span>g</span>
      <span>.</span>
      <span>.</span>
      <span>.</span>
    </h1> -->
  </div>
</template>

<script setup>
import { getTkLoading } from "@/store/tkStore";
import { ref, watch } from "vue";
const loadingShowFlag = ref(false);
const loading = getTkLoading(); //ref(false);
const timeNum = ref(0);

const timerFun = () => {
  timeNum.value++;
};

const cleanData = () => {
  clearInterval(intervalId);
  intervalId = null;
  timeNum.value = 1;
};

let intervalId = null;
let cleanTimeId = null;

watch(loading, (newV, oldV) => {
  if (newV) {
    // cleanData();
    // loadingShowFlag.value = true;
    intervalId = setInterval(timerFun, 1000);
     
  }else{
    cleanData();
  }
  // else{
  //   setTimeout(() => {
  //     cleanData();
  //     loadingShowFlag.value = false;
  //   }, 200);
  // }
});

// loading.value = true;
</script>

<style lang="less" scoped>
.cus-loading {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  // background-color: rgba(255, 255, 255, 0.98);
  background-color: rgba(0, 0, 0, 0.8);
  user-select: none;
}

.scene {
  width: 100%;
  // height: 100%;
  -webkit-perspective: 600;
  perspective: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}
.scene svg {
  width: 240px;
  height: 240px;
}

h1.loadingtext {
  text-align: center;
  text-transform: uppercase;
  font-family: "Nunito", sans-serif;
  font-size: 4.6875em;
  color: transparent;
  letter-spacing: 0.01em;
}
h1.loadingtext span {
  text-shadow: 0 0 2px rgba(255, 253, 253, 0.9), 0 15px 25px rgba(0, 0, 0, 0.3),
    0 -2px 3px rgba(0, 0, 0, 0.1), 0 -5px 10px rgba(22, 22, 22, 0.5),
    0 5px 10px rgba(0, 0, 0, 0.3), 0 3px 4px rgba(22, 22, 22, 0.2),
    0 0 20px rgba(22, 22, 22, 0.45);
  -webkit-animation: letters 0.85s ease-in-out infinite alternate;
  -moz-animation: letters 0.85s ease-in-out infinite alternate;
  -ms-animation: letters 0.85s ease-in-out infinite alternate;
  animation: letters 0.85s ease-in-out infinite alternate;
  -webkit-animation-delay: 0;
  -moz-animation-delay: 0;
  -o-animation-delay: 0;
  animation-delay: 0;
}
h1.loadingtext span:nth-child(2) {
  -webkit-animation-delay: 0.15s;
  -moz-animation-delay: 0.15s;
  -o-animation-delay: 0.15s;
  animation-delay: 0.15s;
}
h1.loadingtext span:nth-child(3) {
  -webkit-animation-delay: 0.3s;
  -moz-animation-delay: 0.3s;
  -o-animation-delay: 0.3s;
  animation-delay: 0.3s;
}
h1.loadingtext span:nth-child(4) {
  -webkit-animation-delay: 0.45s;
  -moz-animation-delay: 0.45s;
  -o-animation-delay: 0.45s;
  animation-delay: 0.45s;
}
h1.loadingtext span:nth-child(5) {
  -webkit-animation-delay: 0.6s;
  -moz-animation-delay: 0.6s;
  -o-animation-delay: 0.6s;
  animation-delay: 0.6s;
}
h1.loadingtext span:nth-child(6) {
  -webkit-animation-delay: 0.75s;
  -moz-animation-delay: 0.75s;
  -o-animation-delay: 0.75s;
  animation-delay: 0.75s;
}
h1.loadingtext span:nth-child(7) {
  -webkit-animation-delay: 0.9s;
  -moz-animation-delay: 0.9s;
  -o-animation-delay: 0.9s;
  animation-delay: 0.9s;
}
h1.loadingtext span:nth-child(8) {
  -webkit-animation-delay: 1.05s;
  -moz-animation-delay: 1.05s;
  -o-animation-delay: 1.05s;
  animation-delay: 1.05s;
}
h1.loadingtext span:nth-child(9) {
  -webkit-animation-delay: 1.2s;
  -moz-animation-delay: 1.2s;
  -o-animation-delay: 1.2s;
  animation-delay: 1.2s;
}
h1.loadingtext span:nth-child(10) {
  -webkit-animation-delay: 1.35s;
  -moz-animation-delay: 1.35s;
  -o-animation-delay: 1.35s;
  animation-delay: 1.35s;
}

@keyframes letters {
  to {
    text-shadow: 0 0 2px rgba(204, 208, 212, 0.2), 0 0 3px rgba(0, 0, 0, 0.02),
      0 0 0 rgba(0, 0, 0, 0), 0 0 0 rgba(255, 255, 255, 0),
      0 0 0 rgba(0, 0, 0, 0), 0 0 0 rgba(255, 255, 255, 0),
      0 0 0 rgba(255, 255, 255, 0);
  }
}
@-moz-keyframes letters {
  to {
    text-shadow: 0 0 2px rgba(204, 208, 212, 0.2), 0 0 3px rgba(0, 0, 0, 0.02),
      0 0 0 rgba(0, 0, 0, 0), 0 0 0 rgba(255, 255, 255, 0),
      0 0 0 rgba(0, 0, 0, 0), 0 0 0 rgba(255, 255, 255, 0),
      0 0 0 rgba(255, 255, 255, 0);
  }
}
@-webkit-keyframes letters {
  to {
    text-shadow: 0 0 2px rgba(22, 22, 22, 0.2), 0 0 3px rgba(0, 0, 0, 0.02),
      0 0 0 rgba(0, 0, 0, 0), 0 0 0 rgba(0, 0, 0, 0), 0 0 0 rgba(0, 0, 0, 0),
      0 0 0 rgba(0, 0, 0, 0), 0 0 0 rgba(0, 0, 0, 0);
  }
}
</style>
