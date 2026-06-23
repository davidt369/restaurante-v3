import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { UseFormReturn } from "react-hook-form";
import type { TransaccionFormValues } from "../types/transaccion.types";

interface TransactionHeaderFormProps {
    form: UseFormReturn<TransaccionFormValues>;
}

export function TransactionHeaderForm({
    form,
}: TransactionHeaderFormProps) {
    return (
        <Form {...form}>
            <form className="grid grid-cols-1 gap-4">
                <FormField
                    control={form.control}
                    name="cliente"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Cliente / Nombre del Pedido</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Nombre del cliente o identificación..."
                                    {...field}
                                    className="h-11 rounded-xl bg-background border-muted-foreground/20 focus:border-primary transition-all shadow-sm"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="concepto"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <Input placeholder="Pedido" {...field} hidden />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </form>
        </Form>
    );
}
