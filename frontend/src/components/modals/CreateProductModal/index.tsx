import {GenericModalProps, IdParam, Product, ProductPriceType, ProductType} from "../../../types.ts";
import {useForm} from "@mantine/form";
import {useParams} from "react-router";
import {ProductForm} from "../../forms/ProductForm";
import {ProductDrawer} from "../../forms/ProductForm/ProductDrawer.tsx";
import {useGetEvent} from "../../../queries/useGetEvent.ts";
import {t} from "@lingui/macro";
import {useCreateProduct} from "../../../mutations/useCreateProduct.ts";
import {showError, showSuccess} from "../../../utilites/notifications.tsx";

interface CreateProductModalProps extends GenericModalProps {
    selectedCategoryId?: IdParam;
}

export const CreateProductModal = ({onClose, selectedCategoryId = undefined}: CreateProductModalProps) => {
    const {eventId} = useParams();
    const {data: event} = useGetEvent(eventId);
    const createProductMutation = useCreateProduct();
    const form = useForm<Product>({
        initialValues: {
            title: '',
            description: '',
            max_per_order: 1,
            min_per_order: 1,
            sale_start_date: '',
            sale_end_date: '',
            start_collapsed: false,
            hide_before_sale_start_date: false,
            hide_after_sale_end_date: false,
            show_quantity_remaining: false,
            hide_when_sold_out: false,
            is_hidden_without_promo_code: false,
            is_highlighted: false,
            highlight_message: undefined,
            waitlist_enabled: true,
            type: ProductPriceType.Free,
            product_type: ProductType.Ticket,
            tax_and_fee_ids: [],
            addon_product_ids: [],
            is_addon_only: false,
            product_category_id: selectedCategoryId ? String(selectedCategoryId) : undefined,
            prices: [{
                price: 0,
                label: undefined,
                sale_end_date: undefined,
                sale_start_date: undefined,
                initial_quantity_available: undefined,
            }],
        },
    });

    const handleCreateProduct = (values: Product) => {
        createProductMutation.mutate({eventId, productData: values}, {
            onSuccess: () => {
                showSuccess(t`Successfully Created Product`);
                form.reset();
                onClose();
            },

            onError: (error: any) => {
                if (error?.response?.data?.errors) {
                    form.setErrors(error.response.data.errors);
                }
                showError(t`Unable to create product. Please check the your details`);
            }
        });
    }

    return (
        <ProductDrawer
            onClose={onClose}
            title={t`Create Ticket or Product`}
            event={event}
            form={form}
            submitLabel={t`Create Product`}
            submitLoading={createProductMutation.isPending}
            submitTestId="product-create-submit-button"
            onSubmit={handleCreateProduct}
        >
            <ProductForm form={form}/>
        </ProductDrawer>
    )
};
