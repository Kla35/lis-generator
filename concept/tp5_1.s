      .equ KEYBOARD, 0x8000FF00
      .equ CONSOLE, 0x80007040

	    .data
#mess:	.asciz "Hello world from NIOS II processor\n"
mess:	.asciz "Hello world\n"
	    .align	4
	    .set noat

	    .text
	    .align	4
	    .global	main

main:
	addi    r4,zero,mess
    call    echo_string
    #call    getc
    #call    putc
	#call    print_string
    #call    clear
	beq     zero,zero,main

print_string:
	add 	  r3,zero,r4
loop:
	ldb	    r4,(r3)
    addi    sp, sp, -4
	beq     r4,zero, eos
    # on empile l’adresse de retour
    stw     ra, 0(sp)
    call    putc
    ldw     ra, 0(sp)
    addi    sp, sp, 4
	addi    r3,r3,1
	beq     zero,zero,	loop
eos:
	ret

echo_string:
   addi     r6, zero, 10
loop_string:
    call    getc
    beq     r2, r6, end_string
    mov   r4, r2
    call    putc
    beq     zero, zero, loop_string
end_string:
    ret

getc:
	movia	  r7,KEYBOARD
polling:
	ldwio	  r5,4(r7)
	beq     r5,zero,polling
	ldwio	  r5,0(r7)
    mov     r2, r5
	#stwio   r5,0(r4)
	ret

putc:
   movia    r7, CONSOLE
   stbio    r4, 0(r7)
   ret

clear:
    movia   r2, CONSOLE
    movia   r4, 128 #le bit pour clear la console
    stbio   r4, 0(r2)
    ret
