import React, { useEffect, useState } from "react";
import { Image, RefreshControl, StyleSheet, View } from "react-native";
import {
  createOrder,
  getApiUrl,
  getMyOrders,
  getProducts,
  isLoggedIn,
  type OrderItem,
  type Product,
} from "../api";
import {
  Badge,
  Body,
  Button,
  Card,
  Divider,
  EmptyState,
  ErrorText,
  Field,
  H1,
  H2,
  H3,
  Input,
  Loader,
  Muted,
  Row,
  Screen,
  colors,
  formatDate,
  formatSom,
} from "../components/ui";

const STATUS_LABELS: Record<OrderItem["status"], string> = {
  NEW: "Yangi",
  CONFIRMED: "Tasdiqlangan",
  DELIVERED: "Yetkazilgan",
  CANCELLED: "Bekor qilingan",
};

const STATUS_TONES: Record<
  OrderItem["status"],
  "warning" | "accent" | "primary" | "danger"
> = {
  NEW: "warning",
  CONFIRMED: "accent",
  DELIVERED: "primary",
  CANCELLED: "danger",
};

export default function ShopScreen({ onGoToLogin }: { onGoToLogin?: () => void }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [logged, setLogged] = useState(false);

  const [selected, setSelected] = useState<Product | null>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [submitting, setSubmitting] = useState(false);

  /** Rasm manzilini to'liq URL ga aylantiradi (nisbiy bo'lsa API manzilini qo'shadi). */
  async function resolveImageUrl(imageUrl: string): Promise<string> {
    if (imageUrl.startsWith("http")) return imageUrl;
    return `${await getApiUrl()}${imageUrl}`;
  }

  async function loadAll() {
    const loggedIn = await isLoggedIn();
    setLogged(loggedIn);

    const items = await getProducts();
    setProducts(items);

    const urls: Record<string, string> = {};
    for (const p of items) {
      if (p.imageUrl) urls[p.id] = await resolveImageUrl(p.imageUrl);
    }
    setImageUrls(urls);

    if (loggedIn) setOrders(await getMyOrders());
    else setOrders([]);
  }

  useEffect(() => {
    (async () => {
      try {
        await loadAll();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Xatolik");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function onRefresh() {
    setRefreshing(true);
    setError(null);
    try {
      await loadAll();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Xatolik");
    } finally {
      setRefreshing(false);
    }
  }

  function onOrderPress(p: Product) {
    if (!logged) {
      onGoToLogin?.();
      return;
    }
    setError(null);
    setSuccess(null);
    setSelected(p);
    setFullName("");
    setPhone("");
    setAddress("");
    setQuantity("1");
  }

  function onQuantityChange(text: string) {
    const digits = text.replace(/[^0-9]/g, "");
    if (digits === "") {
      setQuantity("");
      return;
    }
    const max = selected ? Math.max(1, selected.stock) : 1;
    const value = Math.min(max, Math.max(1, parseInt(digits, 10)));
    setQuantity(String(value));
  }

  async function onSubmit() {
    if (!selected) return;
    if (!fullName.trim() || !phone.trim()) {
      setError("F.I.Sh va telefon raqamini kiriting.");
      return;
    }
    const qty = Math.min(
      Math.max(1, selected.stock),
      Math.max(1, parseInt(quantity, 10) || 1)
    );
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      await createOrder({
        productId: selected.id,
        quantity: qty,
        fullName: fullName.trim(),
        phone: phone.trim(),
        address: address.trim() || undefined,
      });
      setSelected(null);
      setSuccess("Buyurtma qabul qilindi. Tez orada siz bilan bog'lanamiz.");
      await loadAll();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Xatolik");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <Loader label="Yuklanmoqda..." />;

  return (
    <Screen
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
        />
      }
    >
      <H1>Do'kon</H1>
      <Muted>Qonunchilikka mos, 250 grammdan oshmagan o'quv dronlari</Muted>
      <ErrorText message={error} />

      <H2>Mahsulotlar</H2>
      {products.length === 0 ? (
        <EmptyState title="Mahsulotlar yo'q" description="Hozircha do'konda mahsulot mavjud emas." />
      ) : (
        products.map((p) => {
          const uri = imageUrls[p.id];
          const outOfStock = p.stock <= 0;
          return (
            <Card key={p.id}>
              {uri ? (
                <Image source={{ uri }} style={styles.image} resizeMode="cover" />
              ) : null}
              <H3>{p.name}</H3>
              {p.description ? <Muted>{p.description}</Muted> : null}
              <Row style={styles.badges}>
                {p.category ? <Badge label={p.category} tone="accent" /> : null}
                <Badge label={outOfStock ? "Tugagan" : `${p.stock} dona`} tone={outOfStock ? "danger" : "neutral"} />
              </Row>
              <Body style={styles.price}>{formatSom(p.price)}</Body>
              <View style={styles.action}>
                <Button
                  title={logged ? "Buyurtma berish" : "Kirib buyurtma berish"}
                  onPress={() => onOrderPress(p)}
                  disabled={outOfStock}
                  variant="primary"
                />
              </View>
              {!logged ? (
                <Muted>Buyurtma berish uchun hisobingizga kiring.</Muted>
              ) : null}
            </Card>
          );
        })
      )}

      {selected ? (
        <>
          <Divider />
          <Card>
            <H2>Buyurtma berish</H2>
            <Muted>{selected.name}</Muted>
            <Field label="F.I.Sh">
              <Input value={fullName} onChangeText={setFullName} placeholder="Ism va familiya" />
            </Field>
            <Field label="Telefon raqam">
              <Input
                value={phone}
                onChangeText={setPhone}
                placeholder="+998 90 123 45 67"
                keyboardType="phone-pad"
              />
            </Field>
            <Field label="Manzil">
              <Input value={address} onChangeText={setAddress} placeholder="Yetkazish manzili" />
            </Field>
            <Field label="Miqdor" hint={`1 dan ${Math.max(1, selected.stock)} gacha`}>
              <Input value={quantity} onChangeText={onQuantityChange} keyboardType="number-pad" />
            </Field>
            <Row style={styles.formActions}>
              <Button
                title="Buyurtmani yuborish"
                onPress={onSubmit}
                loading={submitting}
                disabled={selected.stock <= 0}
              />
              <Button
                title="Bekor qilish"
                variant="secondary"
                onPress={() => setSelected(null)}
                disabled={submitting}
              />
            </Row>
          </Card>
        </>
      ) : null}

      <Divider />
      <H2>Mening buyurtmalarim</H2>
      {success ? <Muted style={styles.success}>{success}</Muted> : null}
      {!logged ? (
        <EmptyState
          title="Kirish talab qilinadi"
          description="Buyurtmalaringizni ko'rish uchun tizimga kiring."
        />
      ) : orders.length === 0 ? (
        <EmptyState title="Buyurtmalar yo'q" description="Siz hali buyurtma bermagansiz." />
      ) : (
        orders.map((o) => (
          <Card key={o.id}>
            <H3>{o.product.name}</H3>
            <Muted>Miqdor: {o.quantity} dona</Muted>
            <Body style={styles.price}>{formatSom(o.total)}</Body>
            <Row style={styles.orderFooter}>
              <Badge label={STATUS_LABELS[o.status]} tone={STATUS_TONES[o.status]} />
              <Muted>{formatDate(o.createdAt)}</Muted>
            </Row>
          </Card>
        ))
      )}
      {!logged && onGoToLogin ? (
        <Button title="Kirish" variant="secondary" onPress={onGoToLogin} />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  image: { width: "100%", height: 160, borderRadius: 12, marginBottom: 10 },
  badges: { gap: 8, marginTop: 8, marginBottom: 6, flexWrap: "wrap" },
  price: { color: colors.primary, fontWeight: "700", marginTop: 4 },
  action: { marginTop: 10 },
  formActions: { gap: 8, marginTop: 4 },
  orderFooter: { justifyContent: "space-between", marginTop: 8 },
  success: { color: colors.success },
});
