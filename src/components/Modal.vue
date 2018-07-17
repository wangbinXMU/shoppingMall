/*
  模态框：各种弹窗，包括登录框，错误提示框
*/
<template>
<div>
    <!-------模态框----->
    <!--mdShow取值为true时，class生效，模块框显示，否则不显示-->
    <div class="md-modal modal-msg md-modal-transition" v-bind:class="{'md-show':mdShow}">
        <div class="md-modal-inner">
            <div class="md-top">
                <button class="md-close" @click="closeModal"></button>
            </div>
            <div class="md-content">
                <div class="confirm-tips">
                    <slot name="message"></slot>
                </div>
                <div class="btn-wrap">
                    <slot name="btnGroup"></slot>
                </div>
            </div>
        </div>
    </div>
    <!--遮罩,用v-if控制是否显示-->
    <div class="md-overlay"  v-if="mdShow" @click="closeModal"></div>
</div>
</template>
<style>

</style>
<script>
    export default {
        //mdShow控制模块框的显示
        props:["mdShow"],
        data() {
            return {
                msg:"hello vue"
            }
        },
        methods:{
            closeModal(){
                //避免污染组件，将这里的点击事件提到父组件执行
                this.$emit("close");
            }
        },
    }
</script>
